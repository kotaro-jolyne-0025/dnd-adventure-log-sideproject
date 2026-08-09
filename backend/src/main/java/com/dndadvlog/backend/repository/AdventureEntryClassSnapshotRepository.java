package com.dndadvlog.backend.repository;

import com.dndadvlog.backend.entity.AdventureEntryClassSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface AdventureEntryClassSnapshotRepository extends JpaRepository<AdventureEntryClassSnapshot, UUID> {

    @Modifying
    @Query("DELETE FROM AdventureEntryClassSnapshot s WHERE s.adventureEntry.id = :entryId AND s.snapshotType = :snapshotType")
    void deleteByEntryIdAndType(UUID entryId, String snapshotType);
}
