package com.dndadvlog.backend.controller;

import com.dndadvlog.backend.dto.InventoryItemRequest;
import com.dndadvlog.backend.dto.InventoryItemResponse;
import com.dndadvlog.backend.entity.InventoryItem;
import com.dndadvlog.backend.service.InventoryItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/characters/{characterId}/inventory")
@RequiredArgsConstructor
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    @GetMapping
    public List<InventoryItemResponse> getItems(
            @PathVariable UUID characterId,
            @RequestParam(required = false) InventoryItem.ItemType type) {
        log.info("🎒 [GET /api/characters/{}/inventory] 查詢倉庫物品 (type={})", characterId, type);
        return inventoryItemService.getItems(characterId, type);
    }

    @PostMapping
    public ResponseEntity<InventoryItemResponse> createItem(
            @PathVariable UUID characterId,
            @Valid @RequestBody InventoryItemRequest request) {
        log.info("➕ [POST /api/characters/{}/inventory] 新增物品: {}", characterId, request.getItemName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventoryItemService.createItem(characterId, request));
    }

    @PutMapping("/{itemId}")
    public InventoryItemResponse updateItem(
            @PathVariable UUID characterId,
            @PathVariable UUID itemId,
            @Valid @RequestBody InventoryItemRequest request) {
        log.info("✏️ [PUT /api/characters/{}/inventory/{}] 更新物品: {}", characterId, itemId, request.getItemName());
        return inventoryItemService.updateItem(itemId, request);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable UUID characterId,
            @PathVariable UUID itemId) {
        log.info("🗑️ [DELETE /api/characters/{}/inventory/{}] 刪除物品", characterId, itemId);
        inventoryItemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
