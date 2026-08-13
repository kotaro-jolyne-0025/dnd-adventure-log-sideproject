package com.dndadvlog.backend.service;

import com.dndadvlog.backend.dto.*;
import com.dndadvlog.backend.entity.AdventureEntry;
import com.dndadvlog.backend.entity.AdventureEntryClassSnapshot;
import com.dndadvlog.backend.entity.CharacterClassLevel;
import com.dndadvlog.backend.entity.DowntimeActivity;
import com.dndadvlog.backend.exception.ResourceNotFoundException;
import com.dndadvlog.backend.mapper.AdventureEntryMapper;
import com.dndadvlog.backend.mapper.CharacterMapper;
import com.dndadvlog.backend.mapper.DowntimeActivityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdventureEntryService {

    private final AdventureEntryMapper entryMapper;
    private final CharacterMapper characterMapper;
    private final DowntimeActivityMapper downtimeActivityMapper;
    private final CharacterService characterService;

    public List<AdventureEntryResponse> getEntriesByCharacter(UUID characterId) {
        List<AdventureEntry> entries = entryMapper.findByCharacterIdOrderByPlayDateAsc(characterId);
        return entries.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AdventureEntryResponse getEntry(UUID entryId) {
        return toResponse(findEntry(entryId));
    }

    public EntryDefaultsResponse getDefaults(UUID characterId) {
        EntryDefaultsResponse defaults = new EntryDefaultsResponse();
        int totalLevel = characterMapper.sumClassLevelsByCharacterId(characterId);
        if (totalLevel > 0) defaults.setStartingLevel(totalLevel);
        Optional<AdventureEntry> lastEntry =
                entryMapper.findFirstByCharacterIdOrderByPlayDateDescCreatedAtDesc(characterId);
        lastEntry.ifPresent(last -> {
            defaults.setStartingGold(last.getGoldTotal());
            defaults.setStartingDowntime(last.getDowntimeTotal());
            defaults.setStartingMagicItems(last.getMagicItemsTotal());
        });
        return defaults;
    }

    @Transactional
    public AdventureEntryResponse createEntry(UUID characterId, AdventureEntryRequest request) {
        com.dndadvlog.backend.entity.Character character = characterService.findCharacter(characterId);
        AdventureEntry entry = new AdventureEntry();
        entry.setId(UUID.randomUUID());
        entry.setCharacterId(characterId);
        mapRequestToEntry(request, entry);
        entryMapper.insert(entry);
        writeSnapshots(entry.getId(), character.getClassLevels(), "starting");

        if (request.getClassLevels() != null && !request.getClassLevels().isEmpty()) {
            characterMapper.deleteClassLevelsByCharacterId(characterId);
            for (int i = 0; i < request.getClassLevels().size(); i++) {
                CharacterRequest.ClassLevelRequest cl = request.getClassLevels().get(i);
                CharacterClassLevel classLevel = new CharacterClassLevel();
                classLevel.setId(UUID.randomUUID());
                classLevel.setCharacterId(characterId);
                classLevel.setClassName(cl.getClassName());
                classLevel.setLevel(cl.getLevel());
                classLevel.setSortOrder(i);
                characterMapper.insertClassLevel(classLevel);
            }
        } else {
            if (request.getLevelUpClassName() != null && !request.getLevelUpClassName().isBlank()) {
                applyLevelUp(characterId, request.getLevelUpClassName());
            }
            if (request.getCatchupClassName() != null && !request.getCatchupClassName().isBlank()
                    && request.getCatchupCount() != null && request.getCatchupCount() > 0) {
                applyCatchup(characterId, request.getCatchupClassName(), request.getCatchupCount());
            }
        }

        com.dndadvlog.backend.entity.Character afterCharacter = characterService.findCharacter(characterId);
        writeSnapshots(entry.getId(), afterCharacter.getClassLevels(), "ending");
        log.info("冒險記錄建立: ID={}, 名稱={}", entry.getId(), entry.getAdventureName());
        return toResponse(findEntry(entry.getId()));
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
        UUID characterId = entry.getCharacterId();
        mapRequestToEntry(request, entry);
        entryMapper.update(entry);

        if (request.getClassLevels() != null && !request.getClassLevels().isEmpty()) {
            characterMapper.deleteClassLevelsByCharacterId(characterId);
            for (int i = 0; i < request.getClassLevels().size(); i++) {
                CharacterRequest.ClassLevelRequest cl = request.getClassLevels().get(i);
                CharacterClassLevel classLevel = new CharacterClassLevel();
                classLevel.setId(UUID.randomUUID());
                classLevel.setCharacterId(characterId);
                classLevel.setClassName(cl.getClassName());
                classLevel.setLevel(cl.getLevel());
                classLevel.setSortOrder(i);
                characterMapper.insertClassLevel(classLevel);
            }
        } else {
            if (!Objects.equals(oldLevelUpClass, newLevelUpClass)) {
                if (oldLevelUpClass != null && !oldLevelUpClass.isBlank()) {
                    revertLevelUp(characterId, oldLevelUpClass);
                }
            }
            boolean catchupChanged = !Objects.equals(oldCatchupClass, newCatchupClass)
                    || !Objects.equals(oldCatchupCount, newCatchupCount);
            if (catchupChanged && oldCatchupClass != null && !oldCatchupClass.isBlank()
                    && oldCatchupCount != null && oldCatchupCount > 0) {
                revertCatchup(characterId, oldCatchupClass, oldCatchupCount);
            }
            if (!Objects.equals(oldLevelUpClass, newLevelUpClass) && newLevelUpClass != null && !newLevelUpClass.isBlank()) {
                applyLevelUp(characterId, newLevelUpClass);
            }
            if (catchupChanged && newCatchupClass != null && !newCatchupClass.isBlank()
                    && newCatchupCount != null && newCatchupCount > 0) {
                applyCatchup(characterId, newCatchupClass, newCatchupCount);
            }
        }

        entryMapper.deleteSnapshotsByEntryIdAndType(entryId, "starting");
        com.dndadvlog.backend.entity.Character beforeChar = characterService.findCharacter(characterId);
        writeSnapshots(entryId, beforeChar.getClassLevels(), "starting");

        entryMapper.deleteSnapshotsByEntryIdAndType(entryId, "ending");
        com.dndadvlog.backend.entity.Character afterChar = characterService.findCharacter(characterId);
        writeSnapshots(entryId, afterChar.getClassLevels(), "ending");
        log.info("冒險記錄更新: ID={}, 名稱={}", entryId, entry.getAdventureName());
        return toResponse(findEntry(entryId));
    }

    @Transactional
    public void deleteEntry(UUID entryId) {
        findEntry(entryId);
        entryMapper.deleteById(entryId);
    }

    public List<DowntimeActivityResponse> getActivities(UUID entryId) {
        return downtimeActivityMapper.findByEntryIdOrderByCreatedAtAsc(entryId)
                .stream().map(this::toActivityResponse).collect(Collectors.toList());
    }

    @Transactional
    public DowntimeActivityResponse createActivity(UUID entryId, DowntimeActivityRequest request) {
        findEntry(entryId);
        DowntimeActivity activity = new DowntimeActivity();
        activity.setId(UUID.randomUUID());
        activity.setAdventureEntryId(entryId);
        activity.setDescription(request.getDescription());
        downtimeActivityMapper.insert(activity);
        return toActivityResponse(findActivity(activity.getId()));
    }

    @Transactional
    public DowntimeActivityResponse updateActivity(UUID activityId, DowntimeActivityRequest request) {
        DowntimeActivity activity = findActivity(activityId);
        activity.setDescription(request.getDescription());
        downtimeActivityMapper.update(activity);
        return toActivityResponse(findActivity(activityId));
    }

    @Transactional
    public void deleteActivity(UUID activityId) {
        findActivity(activityId);
        downtimeActivityMapper.deleteById(activityId);
    }

    private void applyLevelUp(UUID characterId, String className) {
        com.dndadvlog.backend.entity.Character character = characterService.findCharacter(characterId);
        boolean found = false;
        for (CharacterClassLevel cl : character.getClassLevels()) {
            if (cl.getClassName().equals(className)) {
                characterMapper.updateClassLevelById(cl.getId(), cl.getLevel() + 1);
                found = true;
                break;
            }
        }
        if (!found) {
            CharacterClassLevel newCl = new CharacterClassLevel();
            newCl.setId(UUID.randomUUID());
            newCl.setCharacterId(characterId);
            newCl.setClassName(className);
            newCl.setLevel(1);
            newCl.setSortOrder(character.getClassLevels().size());
            characterMapper.insertClassLevel(newCl);
        }
    }

    private void applyCatchup(UUID characterId, String className, int count) {
        com.dndadvlog.backend.entity.Character character = characterService.findCharacter(characterId);
        boolean found = false;
        for (CharacterClassLevel cl : character.getClassLevels()) {
            if (cl.getClassName().equals(className)) {
                characterMapper.updateClassLevelById(cl.getId(), cl.getLevel() + count);
                found = true;
                break;
            }
        }
        if (!found) {
            CharacterClassLevel newCl = new CharacterClassLevel();
            newCl.setId(UUID.randomUUID());
            newCl.setCharacterId(characterId);
            newCl.setClassName(className);
            newCl.setLevel(count);
            newCl.setSortOrder(character.getClassLevels().size());
            characterMapper.insertClassLevel(newCl);
        }
    }

    private void revertLevelUp(UUID characterId, String className) {
        com.dndadvlog.backend.entity.Character character = characterService.findCharacter(characterId);
        for (CharacterClassLevel cl : character.getClassLevels()) {
            if (cl.getClassName().equals(className)) {
                if (cl.getLevel() <= 1) characterMapper.deleteClassLevelById(cl.getId());
                else characterMapper.updateClassLevelById(cl.getId(), cl.getLevel() - 1);
                break;
            }
        }
    }

    private void revertCatchup(UUID characterId, String className, int count) {
        com.dndadvlog.backend.entity.Character character = characterService.findCharacter(characterId);
        for (CharacterClassLevel cl : character.getClassLevels()) {
            if (cl.getClassName().equals(className)) {
                if (cl.getLevel() <= count) characterMapper.deleteClassLevelById(cl.getId());
                else characterMapper.updateClassLevelById(cl.getId(), cl.getLevel() - count);
                break;
            }
        }
    }

    private void writeSnapshots(UUID entryId, List<CharacterClassLevel> classLevels, String snapshotType) {
        for (int i = 0; i < classLevels.size(); i++) {
            CharacterClassLevel cl = classLevels.get(i);
            AdventureEntryClassSnapshot snap = new AdventureEntryClassSnapshot();
            snap.setId(UUID.randomUUID());
            snap.setAdventureEntryId(entryId);
            snap.setSnapshotType(snapshotType);
            snap.setClassName(cl.getClassName());
            snap.setLevel(cl.getLevel());
            snap.setSortOrder(i);
            entryMapper.insertSnapshot(snap);
        }
    }

    private BigDecimal calcTotal(BigDecimal starting, BigDecimal change, BigDecimal downtimeChange) {
        if (starting == null && change == null && downtimeChange == null) return null;
        BigDecimal s = starting != null ? starting : BigDecimal.ZERO;
        BigDecimal c = change != null ? change : BigDecimal.ZERO;
        BigDecimal d = downtimeChange != null ? downtimeChange : BigDecimal.ZERO;
        return s.add(c).add(d);
    }

    private Integer calcTotalInt(Integer starting, Integer change, Integer downtimeChange) {
        if (starting == null && change == null && downtimeChange == null) return null;
        int s = starting != null ? starting : 0;
        int c = change != null ? change : 0;
        int d = downtimeChange != null ? downtimeChange : 0;
        return s + c + d;
    }

    private void mapRequestToEntry(AdventureEntryRequest request, AdventureEntry entry) {
        entry.setAdventureCode(request.getAdventureCode());
        entry.setAdventureName(request.getAdventureName());
        entry.setPlayDate(request.getPlayDate());
        entry.setDmName(request.getDmName());
        entry.setStartingLevel(request.getStartingLevel());
        if (request.getEndingLevel() != null) {
            entry.setEndingLevel(request.getEndingLevel());
        } else {
            int sl = request.getStartingLevel() != null ? request.getStartingLevel() : 0;
            int lvUp = (request.getLevelUpClassName() != null && !request.getLevelUpClassName().isBlank()) ? 1 : 0;
            int cu = request.getCatchupCount() != null ? request.getCatchupCount() : 0;
            entry.setEndingLevel(sl + lvUp + cu);
        }
        entry.setStartingGold(request.getStartingGold());
        entry.setGoldChange(request.getGoldChange());
        entry.setGoldDowntimeChange(request.getGoldDowntimeChange());
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

    private AdventureEntry findEntry(UUID entryId) {
        AdventureEntry entry = entryMapper.findById(entryId);
        if (entry == null) throw new ResourceNotFoundException("找不到冒險記錄 ID：" + entryId);
        entry.setStartingClassSnapshot(entryMapper.findSnapshotsByEntryIdAndType(entryId, "starting"));
        entry.setEndingClassSnapshot(entryMapper.findSnapshotsByEntryIdAndType(entryId, "ending"));
        entry.setDowntimeActivities(downtimeActivityMapper.findByEntryIdOrderByCreatedAtAsc(entryId));
        return entry;
    }

    private DowntimeActivity findActivity(UUID activityId) {
        DowntimeActivity activity = downtimeActivityMapper.findById(activityId);
        if (activity == null) throw new ResourceNotFoundException("找不到休整期活動 ID：" + activityId);
        return activity;
    }

    private AdventureEntryResponse toResponse(AdventureEntry entry) {
        AdventureEntryResponse response = new AdventureEntryResponse();
        response.setId(entry.getId());
        response.setCharacterId(entry.getCharacterId());
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
        response.setStartingClassSnapshot(entry.getStartingClassSnapshot()
                .stream().map(this::toSnapshotItem).collect(Collectors.toList()));
        response.setEndingClassSnapshot(entry.getEndingClassSnapshot()
                .stream().map(this::toSnapshotItem).collect(Collectors.toList()));
        return response;
    }

    private AdventureEntryResponse.ClassSnapshotItem toSnapshotItem(AdventureEntryClassSnapshot snap) {
        AdventureEntryResponse.ClassSnapshotItem item = new AdventureEntryResponse.ClassSnapshotItem();
        item.setClassName(snap.getClassName());
        item.setLevel(snap.getLevel());
        item.setSortOrder(snap.getSortOrder());
        return item;
    }

    private DowntimeActivityResponse toActivityResponse(DowntimeActivity activity) {
        DowntimeActivityResponse response = new DowntimeActivityResponse();
        response.setId(activity.getId());
        response.setAdventureEntryId(activity.getAdventureEntryId());
        response.setDescription(activity.getDescription());
        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());
        return response;
    }
}