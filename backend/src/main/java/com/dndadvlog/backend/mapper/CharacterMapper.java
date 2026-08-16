package com.dndadvlog.backend.mapper;

import com.dndadvlog.backend.entity.Character;
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

}