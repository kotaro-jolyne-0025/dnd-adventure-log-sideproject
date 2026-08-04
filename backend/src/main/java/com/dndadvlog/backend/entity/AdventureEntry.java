package com.dndadvlog.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "adventure_entry")
@Getter
@Setter
public class AdventureEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private Character character;

    @Column(name = "adventure_code", length = 100)
    private String adventureCode;

    @Column(name = "adventure_name", length = 255)
    private String adventureName;

    @Column(name = "play_date")
    private LocalDate playDate;

    @Column(name = "dm_name", length = 100)
    private String dmName;

    @Column(name = "starting_level")
    private Integer startingLevel;

    @Column(name = "ending_level")
    private Integer endingLevel;

    @Column(name = "starting_gold", precision = 10, scale = 2)
    private BigDecimal startingGold;

    @Column(name = "gold_change", precision = 10, scale = 2)
    private BigDecimal goldChange;

    @Column(name = "gold_total", precision = 10, scale = 2)
    private BigDecimal goldTotal;

    @Column(name = "starting_downtime")
    private Integer startingDowntime;

    @Column(name = "downtime_change")
    private Integer downtimeChange;

    @Column(name = "downtime_total")
    private Integer downtimeTotal;

    @Column(name = "starting_magic_items")
    private Integer startingMagicItems;

    @Column(name = "magic_items_change")
    private Integer magicItemsChange;

    @Column(name = "magic_items_total")
    private Integer magicItemsTotal;

    @Column(name = "gold_downtime_change", precision = 10, scale = 2)
    private java.math.BigDecimal goldDowntimeChange;

    @Column(name = "downtime_downtime_change")
    private Integer downtimeDowntimeChange;

    @Column(name = "magic_items_downtime_change")
    private Integer magicItemsDowntimeChange;

    @Column(name = "adventure_notes", columnDefinition = "TEXT")
    private String adventureNotes;

    @Column(name = "soul_coin_charges_used", length = 255)
    private String soulCoinChargesUsed;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "adventureEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<DowntimeActivity> downtimeActivities = new ArrayList<>();
}
