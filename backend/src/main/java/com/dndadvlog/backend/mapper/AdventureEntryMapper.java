package com.dndadvlog.backend.mapper;

import com.dndadvlog.backend.entity.AdventureEntry;
import com.dndadvlog.backend.entity.AdventureEntryClassSnapshot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Mapper
public interface AdventureEntryMapper {

    List<AdventureEntry> findByCharacterIdOrderByPlayDateAsc(@Param("characterId") UUID characterId);

    AdventureEntry findById(@Param("id") UUID id);

    Optional<AdventureEntry> findFirstByCharacterIdOrderByPlayDateDescCreatedAtDesc(@Param("characterId") UUID characterId);

    void insert(AdventureEntry entry);

    void update(AdventureEntry entry);

    void deleteById(@Param("id") UUID id);

    void insertSnapshot(AdventureEntryClassSnapshot snapshot);

    void deleteSnapshotsByEntryIdAndType(@Param("entryId") UUID entryId, @Param("snapshotType") String snapshotType);

    List<AdventureEntryClassSnapshot> findSnapshotsByEntryIdAndType(@Param("entryId") UUID entryId, @Param("snapshotType") String snapshotType);
}