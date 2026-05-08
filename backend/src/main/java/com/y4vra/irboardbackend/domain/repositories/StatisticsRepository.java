package com.y4vra.irboardbackend.domain.repositories;

import java.util.Map;

public interface StatisticsRepository {
    Map<String, Long> getStakeholderStatistics(Long projectId);
//    Map<String, Long> getDocumentStatistics(Long projectId);
    Map<String, Long> getNonFunctionalRequirementStatistics(Long projectId);
    Map<String, Long> getGlobalFunctionalityStatistics(Long projectId);//aggregate of functionality statistics
    Map<String, Long> getFunctionalityStatistics(Long projectId,Long functionalityId);
    Map<String,Map<String,Long>> getFunctionalitiesStatistics(Long projectId);
}
