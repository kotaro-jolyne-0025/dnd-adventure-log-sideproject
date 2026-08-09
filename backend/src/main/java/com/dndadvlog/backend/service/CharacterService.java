package com.dndadvlog.backend.service;

import com.dndadvlog.backend.dto.CharacterRequest;
import com.dndadvlog.backend.dto.CharacterResponse;
import com.dndadvlog.backend.entity.Character;
import com.dndadvlog.backend.entity.CharacterClassLevel;
import com.dndadvlog.backend.exception.ResourceNotFoundException;
import com.dndadvlog.backend.repository.CharacterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class CharacterService {

    private final CharacterRepository characterRepository;

    public List<CharacterResponse> getAllCharacters() {
        return characterRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CharacterResponse getCharacter(UUID id) {
        return toResponse(findCharacter(id));
    }

    @Transactional
    public CharacterResponse createCharacter(CharacterRequest request) {
        Character character = new Character();
        mapRequestToCharacter(request, character);
        return toResponse(characterRepository.save(character));
    }

    @Transactional
    public CharacterResponse updateCharacter(UUID id, CharacterRequest request) {
        Character character = findCharacter(id);
        character.getClassLevels().clear();
        mapRequestToCharacter(request, character);
        return toResponse(characterRepository.save(character));
    }

    @Transactional
    public void deleteCharacter(UUID id) {
        characterRepository.delete(findCharacter(id));
    }

    private Character findCharacter(UUID id) {
        return characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("找不到角色 ID：" + id));
    }

    private void mapRequestToCharacter(CharacterRequest request, Character character) {
        character.setCharacterName(request.getCharacterName());
        character.setPlayerName(request.getPlayerName());
        character.setRace(request.getRace());
        character.setFaction(request.getFaction());

        AtomicInteger order = new AtomicInteger(0);
        List<CharacterClassLevel> classLevels = request.getClassLevels().stream()
                .map(cl -> {
                    CharacterClassLevel classLevel = new CharacterClassLevel();
                    classLevel.setCharacter(character);
                    classLevel.setClassName(cl.getClassName());
                    classLevel.setLevel(cl.getLevel());
                    classLevel.setSortOrder(order.getAndIncrement());
                    return classLevel;
                }).collect(Collectors.toList());
        character.getClassLevels().addAll(classLevels);
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

        // 目前等級：character_class_level 等級加總
        int totalLevel = character.getClassLevels().stream()
                .mapToInt(CharacterClassLevel::getLevel).sum();
        if (totalLevel > 0) {
            response.setCurrentLevel(totalLevel);
        }

        response.setClassLevels(character.getClassLevels().stream()
                .map(cl -> {
                    CharacterResponse.ClassLevelResponse clResponse = new CharacterResponse.ClassLevelResponse();
                    clResponse.setId(cl.getId());
                    clResponse.setClassName(cl.getClassName());
                    clResponse.setLevel(cl.getLevel());
                    clResponse.setSortOrder(cl.getSortOrder());
                    return clResponse;
                }).collect(Collectors.toList()));
        return response;
    }
}
