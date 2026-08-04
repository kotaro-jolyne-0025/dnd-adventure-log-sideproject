package com.dndadvlog.backend.repository;

import com.dndadvlog.backend.entity.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CharacterRepository extends JpaRepository<Character, UUID> {

    @Query("SELECT COALESCE(SUM(cl.level), 0) FROM CharacterClassLevel cl WHERE cl.character.id = :characterId")
    int sumClassLevelsByCharacterId(@Param("characterId") UUID characterId);
}
