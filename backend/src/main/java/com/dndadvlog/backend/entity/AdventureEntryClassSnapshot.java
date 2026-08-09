package com.dndadvlog.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "adventure_entry_class_snapshot")
@Getter
@Setter
public class AdventureEntryClassSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adventure_entry_id", nullable = false)
    private AdventureEntry adventureEntry;

    /** 'starting' 或 'ending' */
    @Column(name = "snapshot_type", nullable = false, length = 10)
    private String snapshotType;

    @Column(name = "class_name", nullable = false, length = 100)
    private String className;

    @Column(name = "level", nullable = false)
    private Integer level;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
