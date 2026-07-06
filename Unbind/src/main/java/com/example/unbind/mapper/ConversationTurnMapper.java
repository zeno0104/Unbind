package com.example.unbind.mapper;

import com.example.unbind.domain.ConversationTurn;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface ConversationTurnMapper {
	void insert(ConversationTurn turn);

	List<ConversationTurn> findByEntryId(Long entryId);

	void updateStepType(Long id, String stepType);
}