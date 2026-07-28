package com.dndadvlog.backend.service;

import com.dndadvlog.backend.dto.*;
import com.dndadvlog.backend.entity.AdventureEntry;
import com.dndadvlog.backend.entity.Character;
import com.dndadvlog.backend.entity.DowntimeActivity;
import com.dndadvlog.backend.exception.ResourceNotFoundException;
import com.dndadvlog.backend.repository.AdventureEntryRepository;
import com.dndadvlog.backend.repository.CharacterRepository;
import com.dndadvlog.backend.repository.DowntimeActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
        return toResponse(entryRepository.save(entry));
    }

    @Transactional
    public AdventureEntryResponse updateEntry(UUID entryId, AdventureEntryRequest request) {
        AdventureEntry entry = findEntry(entryId);
        mapRequestToEntry(request, entry);
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

    private void mapRequestToEntry(AdventureEntryRequest request, AdventureEntry entry) {
        entry.setAdventureCode(request.getAdventureCode());
        entry.setAdventureName(request.getAdventureName());
        entry.setPlayDate(request.getPlayDate());
        entry.setDmName(request.getDmName());
        entry.setStartingGold(request.getStartingGold());
        entry.setGoldChange(request.getGoldChange());
        entry.setGoldTotal(request.getGoldTotal());
        entry.setStartingDowntime(request.getStartingDowntime());
        entry.setDowntimeChange(request.getDowntimeChange());
        entry.setDowntimeTotal(request.getDowntimeTotal());
        entry.setStartingMagicItems(request.getStartingMagicItems());
        entry.setMagicItemsChange(request.getMagicItemsChange());
        entry.setMagicItemsTotal(request.getMagicItemsTotal());
        entry.setAdventureNotes(request.getAdventureNotes());
        entry.setSoulCoinChargesUsed(request.getSoulCoinChargesUsed());
    }

    private AdventureEntryResponse toResponse(AdventureEntry entry) {
        AdventureEntryResponse response = new AdventureEntryResponse();
        response.setId(entry.getId());
        response.setCharacterId(entry.getCharacter().getId());
        response.setAdventureCode(entry.getAdventureCode());
        response.setAdventureName(entry.getAdventureName());
        response.setPlayDate(entry.getPlayDate());
        response.setDmName(entry.getDmName());
        response.setStartingGold(entry.getStartingGold());
        response.setGoldChange(entry.getGoldChange());
        response.setGoldTotal(entry.getGoldTotal());
        response.setStartingDowntime(entry.getStartingDowntime());
        response.setDowntimeChange(entry.getDowntimeChange());
        response.setDowntimeTotal(entry.getDowntimeTotal());
        response.setStartingMagicItems(entry.getStartingMagicItems());
        response.setMagicItemsChange(entry.getMagicItemsChange());
        response.setMagicItemsTotal(entry.getMagicItemsTotal());
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
