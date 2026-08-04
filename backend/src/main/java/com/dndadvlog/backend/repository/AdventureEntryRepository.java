package com.dndadvlog.backend.repository;

import com.dndadvlog.backend.entity.AdventureEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdventureEntryRepository extends JpaRepository<AdventureEntry, UUID> {
    List<AdventureEntry> findByCharacterIdOrderByPlayDateAsc(UUID characterId);

    Optional<AdventureEntry> findFirstByCharacterIdOrderByPlayDateDescCreatedAtDesc(UUID characterId);
}
