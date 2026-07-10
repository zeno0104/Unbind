package com.example.unbind.mapper;

import com.example.unbind.domain.PatternInsightCache;
import com.example.unbind.domain.RelationshipInsightCache;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface InsightCacheMapper {
	RelationshipInsightCache findRelationshipCache(@Param("userId") Long userId, @Param("tag") String tag);

	void upsertRelationshipCache(@Param("userId") Long userId, @Param("tag") String tag,
			@Param("entryCount") int entryCount, @Param("completedCount") int completedCount,
			@Param("insightText") String insightText);

	PatternInsightCache findPatternCache(@Param("userId") Long userId);

	void upsertPatternCache(@Param("userId") Long userId, @Param("entryCount") int entryCount,
			@Param("completedCount") int completedCount, @Param("patternsJson") String patternsJson);
}
