package com.dndadvlog.backend.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CharacterClassLevel {
    private UUID id;
    private UUID characterId;
    private String className;
    private Integer level;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
