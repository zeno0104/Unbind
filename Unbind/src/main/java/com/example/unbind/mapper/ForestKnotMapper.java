package com.example.unbind.mapper;

import com.example.unbind.domain.ForestKnot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ForestKnotMapper {
	void insert(ForestKnot forestKnot);

	boolean existsByActionItemId(@Param("actionItemId") Long actionItemId);

	List<ForestKnot> findAll(@Param("tag") String tag, @Param("keyword") String keyword,
			@Param("offset") int offset, @Param("limit") int limit);

	ForestKnot findById(@Param("id") Long id);

	void delete(@Param("id") Long id);
}
