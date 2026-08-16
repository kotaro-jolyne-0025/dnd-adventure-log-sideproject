package com.dndadvlog.backend.controller;

import com.dndadvlog.backend.dto.CharacterRequest;
import com.dndadvlog.backend.dto.CharacterResponse;
import com.dndadvlog.backend.service.CharacterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/characters")
@RequiredArgsConstructor
public class CharacterController {

    private final CharacterService characterService;

    @GetMapping
    public List<CharacterResponse> getAllCharacters() {
        log.info("📋 [GET /api/characters] 查詢所有角色");
        return characterService.getAllCharacters();
    }

    @GetMapping("/{id}")
    public CharacterResponse getCharacter(@PathVariable UUID id) {
        log.info("🔍 [GET /api/characters/{}] 查詢角色詳情", id);
        return characterService.getCharacter(id);
    }

    @PostMapping
    public ResponseEntity<CharacterResponse> createCharacter(@Valid @RequestBody CharacterRequest request) {
        log.info("➕ [POST /api/characters] 建立角色: 名稱={}, 玩家={}",
                request.getCharacterName(), request.getPlayerName());
        return ResponseEntity.status(HttpStatus.CREATED).body(characterService.createCharacter(request));
    }

    @PutMapping("/{id}")
    public CharacterResponse updateCharacter(@PathVariable UUID id, @Valid @RequestBody CharacterRequest request) {
        log.info("✏️ [PUT /api/characters/{}] 更新角色: 名稱={}, 玩家={}",
                id, request.getCharacterName(), request.getPlayerName());
        return characterService.updateCharacter(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable UUID id) {
        log.info("🗑️ [DELETE /api/characters/{}] 刪除角色", id);
        characterService.deleteCharacter(id);
        return ResponseEntity.noContent().build();
    }
}
