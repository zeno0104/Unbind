package com.example.unbind.mapper;

import com.example.unbind.domain.ActionItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ActionItemMapper {
	void insert(ActionItem actionItem);

	ActionItem findByEntryId(Long entryId);

	void updateCompleted(@Param("entryId") Long entryId, @Param("isCompleted") int isCompleted,
			@Param("feedback") String feedback);

	Map<String, Object> countStats(Long userId);

	List<ActionItem> findAllByUserId(Long userId);

	void deleteByEntryId(@Param("entryId") Long entryId);

	void deleteAllByUserId(@Param("userId") Long userId);
}