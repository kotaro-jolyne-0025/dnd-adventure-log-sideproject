package com.dndadvlog.backend.repository;

import com.dndadvlog.backend.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
    List<InventoryItem> findByCharacterIdAndItemTypeOrderByCreatedAtAsc(UUID characterId, InventoryItem.ItemType itemType);
    List<InventoryItem> findByCharacterIdOrderByCreatedAtAsc(UUID characterId);
}
