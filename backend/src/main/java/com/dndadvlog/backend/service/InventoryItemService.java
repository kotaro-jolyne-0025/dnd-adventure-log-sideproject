package com.dndadvlog.backend.service;

import com.dndadvlog.backend.dto.InventoryItemRequest;
import com.dndadvlog.backend.dto.InventoryItemResponse;
import com.dndadvlog.backend.entity.Character;
import com.dndadvlog.backend.entity.InventoryItem;
import com.dndadvlog.backend.exception.ResourceNotFoundException;
import com.dndadvlog.backend.repository.CharacterRepository;
import com.dndadvlog.backend.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final CharacterRepository characterRepository;

    public List<InventoryItemResponse> getItems(UUID characterId, InventoryItem.ItemType itemType) {
        List<InventoryItem> items = (itemType != null)
                ? inventoryItemRepository.findByCharacterIdAndItemTypeOrderByCreatedAtAsc(characterId, itemType)
                : inventoryItemRepository.findByCharacterIdOrderByCreatedAtAsc(characterId);
        return items.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public InventoryItemResponse createItem(UUID characterId, InventoryItemRequest request) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("找不到角色 ID：" + characterId));
        InventoryItem item = new InventoryItem();
        item.setCharacter(character);
        mapRequestToItem(request, item);
        return toResponse(inventoryItemRepository.save(item));
    }

    @Transactional
    public InventoryItemResponse updateItem(UUID itemId, InventoryItemRequest request) {
        InventoryItem item = findItem(itemId);
        mapRequestToItem(request, item);
        return toResponse(inventoryItemRepository.save(item));
    }

    @Transactional
    public void deleteItem(UUID itemId) {
        inventoryItemRepository.delete(findItem(itemId));
    }

    private InventoryItem findItem(UUID itemId) {
        return inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("找不到物品 ID：" + itemId));
    }

    private void mapRequestToItem(InventoryItemRequest request, InventoryItem item) {
        item.setItemName(request.getItemName());
        item.setItemType(request.getItemType());
        item.setRarity(request.getRarity());
        item.setQuantity(request.getQuantity() != null ? request.getQuantity() : 1);
        item.setSource(request.getSource());
        item.setNotes(request.getNotes());
    }

    private InventoryItemResponse toResponse(InventoryItem item) {
        InventoryItemResponse response = new InventoryItemResponse();
        response.setId(item.getId());
        response.setCharacterId(item.getCharacter().getId());
        response.setItemName(item.getItemName());
        response.setItemType(item.getItemType());
        response.setRarity(item.getRarity());
        response.setQuantity(item.getQuantity());
        response.setSource(item.getSource());
        response.setNotes(item.getNotes());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }
}
