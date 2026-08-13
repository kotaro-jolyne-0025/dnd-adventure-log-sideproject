package com.dndadvlog.backend.service;

import com.dndadvlog.backend.dto.CharacterRequest;
import com.dndadvlog.backend.dto.CharacterResponse;
import com.dndadvlog.backend.entity.Character;
import com.dndadvlog.backend.entity.CharacterClassLevel;
import com.dndadvlog.backend.exception.ResourceNotFoundException;
import com.dndadvlog.backend.mapper.CharacterMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CharacterService {

    private final CharacterMapper characterMapper;

    public List<CharacterResponse> getAllCharacters() {
        return characterMapper.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CharacterResponse getCharacter(UUID id) {
        return toResponse(findCharacter(id));
    }

    @Transactional
    public CharacterResponse createCharacter(CharacterRequest request) {
        Character character = new Character();
        character.setId(UUID.randomUUID());
        character.setCharacterName(request.getCharacterName());
        character.setPlayerName(request.getPlayerName());
        character.setRace(request.getRace());
        character.setFaction(request.getFaction());
        characterMapper.insert(character);
        for (int i = 0; i < request.getClassLevels().size(); i++) {
            CharacterRequest.ClassLevelRequest cl = request.getClassLevels().get(i);
            CharacterClassLevel classLevel = new CharacterClassLevel();
            classLevel.setId(UUID.randomUUID());
            classLevel.setCharacterId(character.getId());
            classLevel.setClassName(cl.getClassName());
            classLevel.setLevel(cl.getLevel());
            classLevel.setSortOrder(i);
            characterMapper.insertClassLevel(classLevel);
        }
        log.info("角色建立成功: ID={}, 名稱={}", character.getId(), character.getCharacterName());
        return toResponse(findCharacter(character.getId()));
    }

    @Transactional
    public CharacterResponse updateCharacter(UUID id, CharacterRequest request) {
        Character character = findCharacter(id);
        character.setCharacterName(request.getCharacterName());
        character.setPlayerName(request.getPlayerName());
        character.setRace(request.getRace());
        character.setFaction(request.getFaction());
        characterMapper.update(character);
        Character updated = findCharacter(id);
        log.info("角色基本資料更新成功: ID={}, 名稱={}", updated.getId(), updated.getCharacterName());
        return toResponse(updated);
    }

    @Transactional
    public void deleteCharacter(UUID id) {
        findCharacter(id);
        characterMapper.deleteById(id);
        log.info("角色刪除成功: ID={}", id);
    }

    public Character findCharacter(UUID id) {
        Character character = characterMapper.findById(id);
        if (character == null) {
            throw new ResourceNotFoundException("找不到角色 ID：" + id);
        }
        return character;
    }

    private CharacterResponse toResponse(Character character) {
        CharacterResponse response = new CharacterResponse();
        response.setId(character.getId());
        response.setCharacterName(character.getCharacterName());
        response.setPlayerName(character.getPlayerName());
        response.setRace(character.getRace());
        response.setFaction(character.getFaction());
        response.setCreatedAt(character.getCreatedAt());
        response.setUpdatedAt(character.getUpdatedAt());
        List<CharacterClassLevel> validClassLevels = character.getClassLevels() != null
                ? character.getClassLevels().stream()
                    .filter(cl -> cl != null && cl.getClassName() != null && cl.getLevel() != null)
                    .collect(Collectors.toList())
                : List.of();
        int totalLevel = validClassLevels.stream()
                .mapToInt(CharacterClassLevel::getLevel).sum();
        response.setCurrentLevel(totalLevel);
        response.setClassLevels(validClassLevels.stream()
                .map(cl -> {
                    CharacterResponse.ClassLevelResponse clr = new CharacterResponse.ClassLevelResponse();
                    clr.setId(cl.getId());
                    clr.setClassName(cl.getClassName());
                    clr.setLevel(cl.getLevel());
                    clr.setSortOrder(cl.getSortOrder() != null ? cl.getSortOrder() : 0);
                    return clr;
                }).collect(Collectors.toList()));
        return response;
    }
}