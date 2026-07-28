package com.dndadvlog.backend.controller;

import com.dndadvlog.backend.dto.InventoryItemRequest;
import com.dndadvlog.backend.dto.InventoryItemResponse;
import com.dndadvlog.backend.entity.InventoryItem;
import com.dndadvlog.backend.service.InventoryItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/characters/{characterId}/inventory")
@RequiredArgsConstructor
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    @GetMapping
    public List<InventoryItemResponse> getItems(
            @PathVariable UUID characterId,
            @RequestParam(required = false) InventoryItem.ItemType type) {
        return inventoryItemService.getItems(characterId, type);
    }

    @PostMapping
    public ResponseEntity<InventoryItemResponse> createItem(
            @PathVariable UUID characterId,
            @Valid @RequestBody InventoryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventoryItemService.createItem(characterId, request));
    }

    @PutMapping("/{itemId}")
    public InventoryItemResponse updateItem(
            @PathVariable UUID characterId,
            @PathVariable UUID itemId,
            @Valid @RequestBody InventoryItemRequest request) {
        return inventoryItemService.updateItem(itemId, request);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable UUID characterId,
            @PathVariable UUID itemId) {
        inventoryItemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
