package com.dndadvlog.backend.entity;

import lombok.Data;

import java.util.UUID;

@Data
public class AdventureEntryClassSnapshot {
    private UUID id;
    private UUID adventureEntryId;
    /** 'starting' 或 'ending' */
    private String snapshotType;
    private String className;
    private Integer level;
    private Integer sortOrder;
}
