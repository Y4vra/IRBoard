package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.summaries.*;
import com.y4vra.irboardbackend.domain.model.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class SummaryMapper {
    public static RequirementSummary toRequirementSummary(Requirement r) {
        if (r instanceof FunctionalRequirement fr) {
            return new FunctionalRequirementSummaryDTO(
                    fr.getId(),
                    fr.getName(),
                    fr.getDescription(),
                    fr.getState() != null ? fr.getState().name() : null,
                    fr.getFunctionality() != null ? fr.getFunctionality().getId() : null,
                    "FR"
            );
        }
        return new RequirementSummaryDTO(
                r.getId(),
                r.getName(),
                r.getDescription(),
                r.getState() != null ? r.getState().name() : null,
                "NFR"
        );
    }
    public static List<RequirementSummary> toRequirementSummaries(List<Requirement> r) {
        return r.stream().map(SummaryMapper::toRequirementSummary).collect(Collectors.toList());
    }
}
