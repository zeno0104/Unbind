package com.example.unbind.mapper;

import com.example.unbind.domain.ConversationTurn;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ConversationTurnMapper {
	void insert(ConversationTurn turn);

	List<ConversationTurn> findByEntryId(Long entryId);

	void updateStepType(@Param("id") Long id, @Param("stepType") String stepType);
}