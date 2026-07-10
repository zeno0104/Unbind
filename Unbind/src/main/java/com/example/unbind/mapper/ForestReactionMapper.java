package com.example.unbind.mapper;

import com.example.unbind.domain.ForestReaction;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ForestReactionMapper {
	void insert(ForestReaction forestReaction);

	List<ForestReaction> findByForestKnotId(@Param("forestKnotId") Long forestKnotId);

	ForestReaction findById(@Param("id") Long id);

	void updateActionText(@Param("id") Long id, @Param("actionText") String actionText);

	void delete(@Param("id") Long id);

	void deleteByForestKnotId(@Param("forestKnotId") Long forestKnotId);

	void deleteAllByUserId(@Param("userId") Long userId);
}
