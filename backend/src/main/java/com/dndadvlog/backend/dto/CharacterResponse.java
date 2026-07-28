package com.dndadvlog.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CharacterResponse {
    private UUID id;
    private String characterName;
    private String playerName;
    private String race;
    private String faction;
    private List<ClassLevelResponse> classLevels;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class ClassLevelResponse {
        private UUID id;
        private String className;
        private Integer level;
        private Integer sortOrder;
    }
}
