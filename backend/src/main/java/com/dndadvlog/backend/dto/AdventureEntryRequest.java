package com.dndadvlog.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AdventureEntryRequest {
    private String adventureCode;
    private String adventureName;
    private LocalDate playDate;
    private String dmName;
    private BigDecimal startingGold;
    private BigDecimal goldChange;
    private BigDecimal goldTotal;
    private Integer startingDowntime;
    private Integer downtimeChange;
    private Integer downtimeTotal;
    private Integer startingMagicItems;
    private Integer magicItemsChange;
    private Integer magicItemsTotal;
    private String adventureNotes;
    private String soulCoinChargesUsed;
}
