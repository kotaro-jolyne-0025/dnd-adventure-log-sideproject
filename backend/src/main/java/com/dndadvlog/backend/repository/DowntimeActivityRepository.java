package com.dndadvlog.backend.repository;

import com.dndadvlog.backend.entity.DowntimeActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DowntimeActivityRepository extends JpaRepository<DowntimeActivity, UUID> {
    List<DowntimeActivity> findByAdventureEntryIdOrderByCreatedAtAsc(UUID adventureEntryId);
}
