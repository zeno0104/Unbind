package com.example.unbind.service;

import com.example.unbind.domain.User;
import com.example.unbind.exception.AppException;
import com.example.unbind.mapper.ActionItemMapper;
import com.example.unbind.mapper.ConstellationNameMapper;
import com.example.unbind.mapper.ConversationTurnMapper;
import com.example.unbind.mapper.FeedbackMapper;
import com.example.unbind.mapper.ForestKnotMapper;
import com.example.unbind.mapper.ForestReactionMapper;
import com.example.unbind.mapper.ForestScrapMapper;
import com.example.unbind.mapper.JournalEntryMapper;
import com.example.unbind.mapper.PasswordResetTokenMapper;
import com.example.unbind.mapper.PushSubscriptionMapper;
import com.example.unbind.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserMapper userMapper;
	private final ConversationTurnMapper conversationTurnMapper;
	private final ActionItemMapper actionItemMapper;
	private final ForestReactionMapper forestReactionMapper;
	private final ForestScrapMapper forestScrapMapper;
	private final ForestKnotMapper forestKnotMapper;
	private final JournalEntryMapper journalEntryMapper;
	private final ConstellationNameMapper constellationNameMapper;
	private final FeedbackMapper feedbackMapper;
	private final PasswordResetTokenMapper passwordResetTokenMapper;
	private final PushSubscriptionMapper pushSubscriptionMapper;

	@Transactional
	public void deleteAccount(String email) {
		User user = userMapper.findByEmail(email);
		if (user == null) {
			throw new AppException(HttpStatus.NOT_FOUND, "계정을 찾을 수 없어요.");
		}

		Long userId = user.getId();
		forestReactionMapper.deleteAllByUserId(userId);
		forestScrapMapper.deleteAllByUserId(userId);
		forestKnotMapper.deleteAllByUserId(userId);
		conversationTurnMapper.deleteAllByUserId(userId);
		actionItemMapper.deleteAllByUserId(userId);
		journalEntryMapper.deleteAllByUserId(userId);
		constellationNameMapper.deleteAllByUserId(userId);
		feedbackMapper.deleteAllByUserId(userId);
		passwordResetTokenMapper.deleteAllByUserId(userId);
		pushSubscriptionMapper.deleteAllByUserId(userId);
		userMapper.deleteById(userId);
	}
}
