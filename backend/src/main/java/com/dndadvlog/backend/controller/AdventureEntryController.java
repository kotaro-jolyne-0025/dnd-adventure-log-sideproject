package com.dndadvlog.backend.controller;

import com.dndadvlog.backend.dto.*;
import com.dndadvlog.backend.service.AdventureEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AdventureEntryController {

    private final AdventureEntryService adventureEntryService;

    // Adventure Entries
    @GetMapping("/api/characters/{characterId}/entries")
    public List<AdventureEntryResponse> getEntries(@PathVariable UUID characterId) {
        return adventureEntryService.getEntriesByCharacter(characterId);
    }

    @GetMapping("/api/characters/{characterId}/entries/defaults")
    public com.dndadvlog.backend.dto.EntryDefaultsResponse getDefaults(@PathVariable UUID characterId) {
        return adventureEntryService.getDefaults(characterId);
    }

    @GetMapping("/api/entries/{id}")
    public AdventureEntryResponse getEntry(@PathVariable UUID id) {
        return adventureEntryService.getEntry(id);
    }

    @PostMapping("/api/characters/{characterId}/entries")
    public ResponseEntity<AdventureEntryResponse> createEntry(
            @PathVariable UUID characterId,
            @RequestBody AdventureEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adventureEntryService.createEntry(characterId, request));
    }

    @PutMapping("/api/entries/{id}")
    public AdventureEntryResponse updateEntry(
            @PathVariable UUID id,
            @RequestBody AdventureEntryRequest request) {
        return adventureEntryService.updateEntry(id, request);
    }

    @DeleteMapping("/api/entries/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable UUID id) {
        adventureEntryService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }

    // Downtime Activities
    @GetMapping("/api/entries/{entryId}/downtime-activities")
    public List<DowntimeActivityResponse> getActivities(@PathVariable UUID entryId) {
        return adventureEntryService.getActivities(entryId);
    }

    @PostMapping("/api/entries/{entryId}/downtime-activities")
    public ResponseEntity<DowntimeActivityResponse> createActivity(
            @PathVariable UUID entryId,
            @RequestBody DowntimeActivityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adventureEntryService.createActivity(entryId, request));
    }

    @PutMapping("/api/downtime-activities/{id}")
    public DowntimeActivityResponse updateActivity(
            @PathVariable UUID id,
            @RequestBody DowntimeActivityRequest request) {
        return adventureEntryService.updateActivity(id, request);
    }

    @DeleteMapping("/api/downtime-activities/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable UUID id) {
        adventureEntryService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }
}
