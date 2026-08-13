package com.dndadvlog.backend.mapper;

import com.dndadvlog.backend.entity.Character;
import com.dndadvlog.backend.entity.CharacterClassLevel;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface CharacterMapper {

    List<Character> findAll();

    Character findById(@Param("id") UUID id);

    void insert(Character character);

    void update(Character character);

    void deleteById(@Param("id") UUID id);

    void insertClassLevel(CharacterClassLevel classLevel);

    void updateClassLevelById(@Param("id") UUID id, @Param("level") int level);

    void deleteClassLevelById(@Param("id") UUID id);

    void deleteClassLevelsByCharacterId(@Param("characterId") UUID characterId);

    int sumClassLevelsByCharacterId(@Param("characterId") UUID characterId);
}