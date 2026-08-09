package com.dndadvlog.backend.service;

import com.dndadvlog.backend.dto.*;
import com.dndadvlog.backend.entity.AdventureEntry;
import com.dndadvlog.backend.entity.Character;
import com.dndadvlog.backend.entity.CharacterClassLevel;
import com.dndadvlog.backend.entity.DowntimeActivity;
import com.dndadvlog.backend.exception.ResourceNotFoundException;
import com.dndadvlog.backend.repository.AdventureEntryRepository;
import com.dndadvlog.backend.repository.CharacterRepository;
import com.dndadvlog.backend.repository.DowntimeActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdventureEntryService {

    private final AdventureEntryRepository entryRepository;
    private final CharacterRepository characterRepository;
    private final DowntimeActivityRepository downtimeActivityRepository;

    public List<AdventureEntryResponse> getEntriesByCharacter(UUID characterId) {
        return entryRepository.findByCharacterIdOrderByPlayDateAsc(characterId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AdventureEntryResponse getEntry(UUID entryId) {
        return toResponse(findEntry(entryId));
    }

    @Transactional
    public AdventureEntryResponse createEntry(UUID characterId, AdventureEntryRequest request) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("找不到角色 ID：" + characterId));
        AdventureEntry entry = new AdventureEntry();
        entry.setCharacter(character);
        mapRequestToEntry(request, entry);
        // 若有升級職業，套用升級
        if (request.getLevelUpClassName() != null && !request.getLevelUpClassName().isBlank()) {
            applyLevelUp(character, request.getLevelUpClassName());
        }
        // 若有迎頭趕上，套用
        if (request.getCatchupClassName() != null && !request.getCatchupClassName().isBlank()
                && request.getCatchupCount() != null && request.getCatchupCount() > 0) {
            applyCatchup(character, request.getCatchupClassName(), request.getCatchupCount());
        }
        return toResponse(entryRepository.save(entry));
    }

    @Transactional
    public AdventureEntryResponse updateEntry(UUID entryId, AdventureEntryRequest request) {
        AdventureEntry entry = findEntry(entryId);
        String oldLevelUpClass = entry.getLevelUpClassName();
        String newLevelUpClass = request.getLevelUpClassName();
        String oldCatchupClass = entry.getCatchupClassName();
        Integer oldCatchupCount = entry.getCatchupCount();
        String newCatchupClass = request.getCatchupClassName();
        Integer newCatchupCount = request.getCatchupCount();
        mapRequestToEntry(request, entry);
        // 若升級職業有變動，先撤回舊值再套用新值
        if (!Objects.equals(oldLevelUpClass, newLevelUpClass)) {
            Character character = entry.getCharacter();
            if (oldLevelUpClass != null && !oldLevelUpClass.isBlank()) {
                revertLevelUp(character, oldLevelUpClass);
            }
            if (newLevelUpClass != null && !newLevelUpClass.isBlank()) {
                applyLevelUp(character, newLevelUpClass);
            }
        }
        // 若迎頭趕上有變動，先撤回舊值再套用新值
        boolean catchupChanged = !Objects.equals(oldCatchupClass, newCatchupClass)
                || !Objects.equals(oldCatchupCount, newCatchupCount);
        if (catchupChanged) {
            Character character = entry.getCharacter();
            if (oldCatchupClass != null && !oldCatchupClass.isBlank()
                    && oldCatchupCount != null && oldCatchupCount > 0) {
                revertCatchup(character, oldCatchupClass, oldCatchupCount);
            }
            if (newCatchupClass != null && !newCatchupClass.isBlank()
                    && newCatchupCount != null && newCatchupCount > 0) {
                applyCatchup(character, newCatchupClass, newCatchupCount);
            }
        }
        return toResponse(entryRepository.save(entry));
    }

    @Transactional
    public void deleteEntry(UUID entryId) {
        entryRepository.delete(findEntry(entryId));
    }

    // Downtime Activities
    public List<DowntimeActivityResponse> getActivities(UUID entryId) {
        return downtimeActivityRepository.findByAdventureEntryIdOrderByCreatedAtAsc(entryId)
                .stream().map(this::toActivityResponse).collect(Collectors.toList());
    }

    @Transactional
    public DowntimeActivityResponse createActivity(UUID entryId, DowntimeActivityRequest request) {
        AdventureEntry entry = findEntry(entryId);
        DowntimeActivity activity = new DowntimeActivity();
        activity.setAdventureEntry(entry);
        activity.setDescription(request.getDescription());
        return toActivityResponse(downtimeActivityRepository.save(activity));
    }

    @Transactional
    public DowntimeActivityResponse updateActivity(UUID activityId, DowntimeActivityRequest request) {
        DowntimeActivity activity = downtimeActivityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("找不到休整期活動 ID：" + activityId));
        activity.setDescription(request.getDescription());
        return toActivityResponse(downtimeActivityRepository.save(activity));
    }

    @Transactional
    public void deleteActivity(UUID activityId) {
        DowntimeActivity activity = downtimeActivityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("找不到休整期活動 ID：" + activityId));
        downtimeActivityRepository.delete(activity);
    }

    private AdventureEntry findEntry(UUID entryId) {
        return entryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("找不到冒險記錄 ID：" + entryId));
    }

    public EntryDefaultsResponse getDefaults(UUID characterId) {
        EntryDefaultsResponse defaults = new EntryDefaultsResponse();
        // 起始等級來源：character_class_level 的等級加總
        int totalLevel = characterRepository.sumClassLevelsByCharacterId(characterId);
        if (totalLevel > 0) {
            defaults.setStartingLevel(totalLevel);
        }
        entryRepository.findFirstByCharacterIdOrderByPlayDateDescCreatedAtDesc(characterId)
                .ifPresent(last -> {
                    defaults.setStartingGold(last.getGoldTotal());
                    defaults.setStartingDowntime(last.getDowntimeTotal());
                    defaults.setStartingMagicItems(last.getMagicItemsTotal());
                });
        return defaults;
    }

    /** 套用升級：找同名職業 +1，不存在則新增 level=1 */
    private void applyLevelUp(Character character, String className) {
        character.getClassLevels().stream()
                .filter(cl -> cl.getClassName().equals(className))
                .findFirst()
                .ifPresentOrElse(
                        cl -> cl.setLevel(cl.getLevel() + 1),
                        () -> {
                            CharacterClassLevel newCl = new CharacterClassLevel();
                            newCl.setCharacter(character);
                            newCl.setClassName(className);
                            newCl.setLevel(1);
                            newCl.setSortOrder(character.getClassLevels().size());
                            character.getClassLevels().add(newCl);
                        }
                );
    }

    /** 套用迎頭趕上：找同名職業 +count，不存在則新增 level=count */
    private void applyCatchup(Character character, String className, int count) {
        character.getClassLevels().stream()
                .filter(cl -> cl.getClassName().equals(className))
                .findFirst()
                .ifPresentOrElse(
                        cl -> cl.setLevel(cl.getLevel() + count),
                        () -> {
                            CharacterClassLevel newCl = new CharacterClassLevel();
                            newCl.setCharacter(character);
                            newCl.setClassName(className);
                            newCl.setLevel(count);
                            newCl.setSortOrder(character.getClassLevels().size());
                            character.getClassLevels().add(newCl);
                        }
                );
    }

    /** 撤回迎頭趕上：找同名職業 -count，降為 0 以下則從清單移除 */
    private void revertCatchup(Character character, String className, int count) {
        character.getClassLevels().stream()
                .filter(cl -> cl.getClassName().equals(className))
                .findFirst()
                .ifPresent(cl -> {
                    if (cl.getLevel() <= count) {
                        character.getClassLevels().remove(cl);
                    } else {
                        cl.setLevel(cl.getLevel() - count);
                    }
                });
    }

    /** 撤回升級：找同名職業 -1，降為 0 則從清單移除 */
    private void revertLevelUp(Character character, String className) {
        character.getClassLevels().stream()
                .filter(cl -> cl.getClassName().equals(className))
                .findFirst()
                .ifPresent(cl -> {
                    if (cl.getLevel() <= 1) {
                        character.getClassLevels().remove(cl);
                    } else {
                        cl.setLevel(cl.getLevel() - 1);
                    }
                });
    }

    private void mapRequestToEntry(AdventureEntryRequest request, AdventureEntry entry) {
        entry.setAdventureCode(request.getAdventureCode());
        entry.setAdventureName(request.getAdventureName());
        entry.setPlayDate(request.getPlayDate());
        entry.setDmName(request.getDmName());
        entry.setStartingLevel(request.getStartingLevel());
        // endingLevel = startingLevel + (levelUp ? 1 : 0) + (catchupCount ?? 0)
        int sl = request.getStartingLevel() != null ? request.getStartingLevel() : 0;
        int lvUp = (request.getLevelUpClassName() != null && !request.getLevelUpClassName().isBlank()) ? 1 : 0;
        int cu = (request.getCatchupCount() != null) ? request.getCatchupCount() : 0;
        entry.setEndingLevel(sl + lvUp + cu);
        entry.setStartingGold(request.getStartingGold());
        entry.setGoldChange(request.getGoldChange());
        entry.setGoldDowntimeChange(request.getGoldDowntimeChange());
        // 後端計算合計：起始 + 冒險變化 + 休整期變化
        entry.setGoldTotal(calcTotal(request.getStartingGold(), request.getGoldChange(), request.getGoldDowntimeChange()));
        entry.setStartingDowntime(request.getStartingDowntime());
        entry.setDowntimeChange(request.getDowntimeChange());
        entry.setDowntimeDowntimeChange(request.getDowntimeDowntimeChange());
        entry.setDowntimeTotal(calcTotalInt(request.getStartingDowntime(), request.getDowntimeChange(), request.getDowntimeDowntimeChange()));
        entry.setStartingMagicItems(request.getStartingMagicItems());
        entry.setMagicItemsChange(request.getMagicItemsChange());
        entry.setMagicItemsDowntimeChange(request.getMagicItemsDowntimeChange());
        entry.setMagicItemsTotal(calcTotalInt(request.getStartingMagicItems(), request.getMagicItemsChange(), request.getMagicItemsDowntimeChange()));
        entry.setLevelUpClassName(request.getLevelUpClassName());
        entry.setCatchupClassName(request.getCatchupClassName());
        entry.setCatchupCount(request.getCatchupCount());
        entry.setAdventureNotes(request.getAdventureNotes());
        entry.setSoulCoinChargesUsed(request.getSoulCoinChargesUsed());
    }

    private java.math.BigDecimal calcTotal(java.math.BigDecimal starting, java.math.BigDecimal change, java.math.BigDecimal downtimeChange) {
        if (starting == null && change == null && downtimeChange == null) return null;
        java.math.BigDecimal s = starting != null ? starting : java.math.BigDecimal.ZERO;
        java.math.BigDecimal c = change != null ? change : java.math.BigDecimal.ZERO;
        java.math.BigDecimal d = downtimeChange != null ? downtimeChange : java.math.BigDecimal.ZERO;
        return s.add(c).add(d);
    }

    private Integer calcTotalInt(Integer starting, Integer change, Integer downtimeChange) {
        if (starting == null && change == null && downtimeChange == null) return null;
        int s = starting != null ? starting : 0;
        int c = change != null ? change : 0;
        int d = downtimeChange != null ? downtimeChange : 0;
        return s + c + d;
    }

    private AdventureEntryResponse toResponse(AdventureEntry entry) {
        AdventureEntryResponse response = new AdventureEntryResponse();
        response.setId(entry.getId());
        response.setCharacterId(entry.getCharacter().getId());
        response.setAdventureCode(entry.getAdventureCode());
        response.setAdventureName(entry.getAdventureName());
        response.setPlayDate(entry.getPlayDate());
        response.setDmName(entry.getDmName());
        response.setStartingLevel(entry.getStartingLevel());
        response.setEndingLevel(entry.getEndingLevel());
        response.setStartingGold(entry.getStartingGold());
        response.setGoldChange(entry.getGoldChange());
        response.setGoldDowntimeChange(entry.getGoldDowntimeChange());
        response.setGoldTotal(entry.getGoldTotal());
        response.setStartingDowntime(entry.getStartingDowntime());
        response.setDowntimeChange(entry.getDowntimeChange());
        response.setDowntimeDowntimeChange(entry.getDowntimeDowntimeChange());
        response.setDowntimeTotal(entry.getDowntimeTotal());
        response.setStartingMagicItems(entry.getStartingMagicItems());
        response.setMagicItemsChange(entry.getMagicItemsChange());
        response.setMagicItemsDowntimeChange(entry.getMagicItemsDowntimeChange());
        response.setMagicItemsTotal(entry.getMagicItemsTotal());
        response.setLevelUpClassName(entry.getLevelUpClassName());
        response.setCatchupClassName(entry.getCatchupClassName());
        response.setCatchupCount(entry.getCatchupCount());
        response.setAdventureNotes(entry.getAdventureNotes());
        response.setSoulCoinChargesUsed(entry.getSoulCoinChargesUsed());
        response.setCreatedAt(entry.getCreatedAt());
        response.setUpdatedAt(entry.getUpdatedAt());
        response.setDowntimeActivities(entry.getDowntimeActivities()
                .stream().map(this::toActivityResponse).collect(Collectors.toList()));
        return response;
    }

    private DowntimeActivityResponse toActivityResponse(DowntimeActivity activity) {
        DowntimeActivityResponse response = new DowntimeActivityResponse();
        response.setId(activity.getId());
        response.setAdventureEntryId(activity.getAdventureEntry().getId());
        response.setDescription(activity.getDescription());
        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());
        return response;
    }
}
