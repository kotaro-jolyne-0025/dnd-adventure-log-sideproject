package com.dndadvlog.backend.controller;

import com.dndadvlog.backend.dto.CharacterRequest;
import com.dndadvlog.backend.dto.CharacterResponse;
import com.dndadvlog.backend.service.CharacterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/characters")
@RequiredArgsConstructor
public class CharacterController {

    private final CharacterService characterService;

    @GetMapping
    public List<CharacterResponse> getAllCharacters() {
        return characterService.getAllCharacters();
    }

    @GetMapping("/{id}")
    public CharacterResponse getCharacter(@PathVariable UUID id) {
        return characterService.getCharacter(id);
    }

    @PostMapping
    public ResponseEntity<CharacterResponse> createCharacter(@Valid @RequestBody CharacterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(characterService.createCharacter(request));
    }

    @PutMapping("/{id}")
    public CharacterResponse updateCharacter(@PathVariable UUID id, @Valid @RequestBody CharacterRequest request) {
        return characterService.updateCharacter(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable UUID id) {
        characterService.deleteCharacter(id);
        return ResponseEntity.noContent().build();
    }
}
