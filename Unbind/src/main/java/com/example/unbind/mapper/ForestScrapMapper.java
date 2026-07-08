package com.example.unbind.mapper;

import com.example.unbind.domain.ForestScrap;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ForestScrapMapper {
	void insert(ForestScrap forestScrap);

	void delete(@Param("userId") Long userId, @Param("forestKnotId") Long forestKnotId);

	void deleteByForestKnotId(@Param("forestKnotId") Long forestKnotId);

	void updateMemo(@Param("id") Long id, @Param("memo") String memo);

	ForestScrap findByUserAndKnot(@Param("userId") Long userId, @Param("forestKnotId") Long forestKnotId);

	List<Long> findKnotIdsByUserId(@Param("userId") Long userId);

	List<ForestScrap> findAllByUser(@Param("userId") Long userId, @Param("tag") String tag);
}
