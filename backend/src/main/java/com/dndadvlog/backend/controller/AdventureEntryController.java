package com.dndadvlog.backend.controller;

import com.dndadvlog.backend.dto.*;
import com.dndadvlog.backend.service.AdventureEntryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AdventureEntryController {

    private final AdventureEntryService adventureEntryService;

    // Adventure Entries
    @GetMapping("/api/characters/{characterId}/entries")
    public List<AdventureEntryResponse> getEntries(@PathVariable UUID characterId) {
        log.info("📜 [GET /api/characters/{}/entries] 查詢冒險記錄列表", characterId);
        return adventureEntryService.getEntriesByCharacter(characterId);
    }

    @GetMapping("/api/characters/{characterId}/entries/defaults")
    public com.dndadvlog.backend.dto.EntryDefaultsResponse getDefaults(@PathVariable UUID characterId) {
        log.info("⚙️ [GET /api/characters/{}/entries/defaults] 取得新記錄預設起始值", characterId);
        return adventureEntryService.getDefaults(characterId);
    }

    @GetMapping("/api/entries/{id}")
    public AdventureEntryResponse getEntry(@PathVariable UUID id) {
        log.info("🔍 [GET /api/entries/{}] 查詢冒險記錄詳情", id);
        return adventureEntryService.getEntry(id);
    }

    @PostMapping("/api/characters/{characterId}/entries")
    public ResponseEntity<AdventureEntryResponse> createEntry(
            @PathVariable UUID characterId,
            @RequestBody AdventureEntryRequest request) {
        log.info("➕ [POST /api/characters/{}/entries] 新增冒險記錄: 名稱={}, 代碼={}",
                characterId, request.getAdventureName(), request.getAdventureCode());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adventureEntryService.createEntry(characterId, request));
    }

    @PutMapping("/api/entries/{id}")
    public AdventureEntryResponse updateEntry(
            @PathVariable UUID id,
            @RequestBody AdventureEntryRequest request) {
        log.info("✏️ [PUT /api/entries/{}] 更新冒險記錄: 名稱={}, 代碼={}",
                id, request.getAdventureName(), request.getAdventureCode());
        return adventureEntryService.updateEntry(id, request);
    }

    @DeleteMapping("/api/entries/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable UUID id) {
        log.info("🗑️ [DELETE /api/entries/{}] 刪除冒險記錄", id);
        adventureEntryService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }

    // Downtime Activities
    @GetMapping("/api/entries/{entryId}/downtime-activities")
    public List<DowntimeActivityResponse> getActivities(@PathVariable UUID entryId) {
        log.info("🏕️ [GET /api/entries/{}/downtime-activities] 查詢休整期活動", entryId);
        return adventureEntryService.getActivities(entryId);
    }

    @PostMapping("/api/entries/{entryId}/downtime-activities")
    public ResponseEntity<DowntimeActivityResponse> createActivity(
            @PathVariable UUID entryId,
            @RequestBody DowntimeActivityRequest request) {
        log.info("➕ [POST /api/entries/{}/downtime-activities] 新增休整期活動: {}", entryId, request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adventureEntryService.createActivity(entryId, request));
    }

    @PutMapping("/api/downtime-activities/{id}")
    public DowntimeActivityResponse updateActivity(
            @PathVariable UUID id,
            @RequestBody DowntimeActivityRequest request) {
        log.info("✏️ [PUT /api/downtime-activities/{}] 更新休整期活動", id);
        return adventureEntryService.updateActivity(id, request);
    }

    @DeleteMapping("/api/downtime-activities/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable UUID id) {
        log.info("🗑️ [DELETE /api/downtime-activities/{}] 刪除休整期活動", id);
        adventureEntryService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }
}
