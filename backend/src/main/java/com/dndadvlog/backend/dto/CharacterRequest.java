package com.dndadvlog.backend.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
public class CharacterRequest {

    @NotBlank(message = "角色名稱為必填")
    private String characterName;

    @NotBlank(message = "玩家名稱為必填")
    private String playerName;

    @NotBlank(message = "種族為必填")
    private String race;

    private String faction;

    @NotEmpty(message = "職業/等級至少需填寫一筆")
    private List<ClassLevelRequest> classLevels;

    @Data
    public static class ClassLevelRequest {
        @NotBlank(message = "職業名稱為必填")
        private String className;
        private Integer level;
    }
}
