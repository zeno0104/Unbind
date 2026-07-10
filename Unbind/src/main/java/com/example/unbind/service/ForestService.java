package com.example.unbind.service;

import com.example.unbind.domain.ActionItem;
import com.example.unbind.domain.ForestKnot;
import com.example.unbind.domain.ForestModerationResult;
import com.example.unbind.domain.ForestReaction;
import com.example.unbind.domain.ForestScrap;
import com.example.unbind.domain.JournalEntry;
import com.example.unbind.domain.ReactionModerationResult;
import com.example.unbind.domain.User;
import com.example.unbind.exception.AppException;
import com.example.unbind.mapper.ActionItemMapper;
import com.example.unbind.mapper.ForestKnotMapper;
import com.example.unbind.mapper.ForestReactionMapper;
import com.example.unbind.mapper.ForestScrapMapper;
import com.example.unbind.mapper.JournalEntryMapper;
import com.example.unbind.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ForestService {

	private static final String UNTAGGED = "기타";
	private static final List<String> VALID_CATEGORIES = List.of("가족", "연인", "친구", "직장", "기타");
	private static final int MAX_TEXT_LENGTH = 300;
	private static final int PAGE_SIZE = 20;

	private final ActionItemMapper actionItemMapper;
	private final JournalEntryMapper journalEntryMapper;
	private final ForestKnotMapper forestKnotMapper;
	private final ForestReactionMapper forestReactionMapper;
	private final ForestScrapMapper forestScrapMapper;
	private final UserMapper userMapper;
	private final ClaudeService claudeService;

	public ForestKnot shareToForest(String email, Long actionItemId) {
		User user = userMapper.findByEmail(email);

		ActionItem actionItem = actionItemMapper.findAllByUserId(user.getId()).stream()
				.filter(a -> a.getId().equals(actionItemId)).findFirst()
				.orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "그 다짐을 찾을 수 없어요."));

		if (actionItem.getIsCompleted() == null || actionItem.getIsCompleted() != 1) {
			throw new AppException(HttpStatus.BAD_REQUEST, "완료한 다짐만 매듭 숲에 풀어놓을 수 있어요.");
		}
		if (forestKnotMapper.existsByActionItemId(actionItemId)) {
			throw new AppException(HttpStatus.CONFLICT, "이미 매듭 숲에 풀어놓은 다짐이에요.");
		}

		JournalEntry entry = journalEntryMapper.findById(actionItem.getEntryId());

		ForestModerationResult result = claudeService.moderateForForest(entry.getSituationText(),
				actionItem.getContent());

		if (!result.isApproved()) {
			throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "지금은 이 다짐을 매듭 숲에 풀어놓을 수 없어요.");
		}

		ForestKnot forestKnot = new ForestKnot();
		forestKnot.setUserId(user.getId());
		forestKnot.setActionItemId(actionItemId);
		forestKnot.setTag(VALID_CATEGORIES.contains(result.getRelationshipCategory())
				? result.getRelationshipCategory()
				: UNTAGGED);
		forestKnot.setSituationSummary(result.getSituationSummary());
		forestKnot.setActionText(result.getActionText());
		forestKnotMapper.insert(forestKnot);

		return forestKnot;
	}

	public List<ForestKnot> getForestKnots(String email, String tag, String keyword, int page) {
		User user = userMapper.findByEmail(email);
		int safePage = Math.max(page, 0);
		List<ForestKnot> knots = forestKnotMapper.findAll(tag, keyword == null || keyword.isBlank() ? null : keyword.trim(),
				safePage * PAGE_SIZE, PAGE_SIZE);
		List<Long> scrappedKnotIds = forestScrapMapper.findKnotIdsByUserId(user.getId());

		for (ForestKnot knot : knots) {
			knot.setMine(user.getId().equals(knot.getUserId()));
			knot.setScrapped(scrappedKnotIds.contains(knot.getId()));
		}
		return knots;
	}

	public ForestKnot getKnotById(String email, Long forestKnotId) {
		ForestKnot knot = forestKnotMapper.findById(forestKnotId);
		if (knot == null) {
			throw new AppException(HttpStatus.NOT_FOUND, "그 매듭을 찾을 수 없어요.");
		}
		User user = userMapper.findByEmail(email);
		knot.setMine(user.getId().equals(knot.getUserId()));
		knot.setScrapped(forestScrapMapper.findByUserAndKnot(user.getId(), forestKnotId) != null);
		return knot;
	}

	public void withdrawKnot(String email, Long forestKnotId) {
		ForestKnot knot = forestKnotMapper.findById(forestKnotId);
		if (knot == null) {
			throw new AppException(HttpStatus.NOT_FOUND, "그 매듭을 찾을 수 없어요.");
		}
		User user = userMapper.findByEmail(email);
		if (!knot.getUserId().equals(user.getId())) {
			throw new AppException(HttpStatus.FORBIDDEN, "본인이 풀어놓은 매듭만 회수할 수 있어요.");
		}
		forestReactionMapper.deleteByForestKnotId(forestKnotId);
		forestScrapMapper.deleteByForestKnotId(forestKnotId);
		forestKnotMapper.delete(forestKnotId);
	}

	public List<ForestReaction> getReactions(String email, Long forestKnotId) {
		User user = userMapper.findByEmail(email);
		List<ForestReaction> reactions = forestReactionMapper.findByForestKnotId(forestKnotId);
		for (ForestReaction reaction : reactions) {
			reaction.setMine(user.getId().equals(reaction.getUserId()));
		}
		return reactions;
	}

	public ForestReaction updateReaction(String email, Long reactionId, String actionText) {
		String validated = validateReactionText(actionText);

		ForestReaction reaction = forestReactionMapper.findById(reactionId);
		if (reaction == null) {
			throw new AppException(HttpStatus.NOT_FOUND, "그 공감을 찾을 수 없어요.");
		}

		User user = userMapper.findByEmail(email);
		if (!reaction.getUserId().equals(user.getId())) {
			throw new AppException(HttpStatus.FORBIDDEN, "본인이 남긴 공감만 수정할 수 있어요.");
		}

		ReactionModerationResult moderation = claudeService.moderateReaction(validated);
		if (!moderation.isApproved()) {
			throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "지금은 이 내용으로 수정할 수 없어요.");
		}

		forestReactionMapper.updateActionText(reactionId, moderation.getActionText());
		return forestReactionMapper.findById(reactionId);
	}

	public void deleteReaction(String email, Long reactionId) {
		ForestReaction reaction = forestReactionMapper.findById(reactionId);
		if (reaction == null) {
			throw new AppException(HttpStatus.NOT_FOUND, "그 공감을 찾을 수 없어요.");
		}

		User user = userMapper.findByEmail(email);
		if (!reaction.getUserId().equals(user.getId())) {
			throw new AppException(HttpStatus.FORBIDDEN, "본인이 남긴 공감만 삭제할 수 있어요.");
		}

		forestReactionMapper.delete(reactionId);
	}

	public ForestReaction addReaction(String email, Long forestKnotId, String actionText) {
		String validated = validateReactionText(actionText);

		ForestKnot knot = forestKnotMapper.findById(forestKnotId);
		if (knot == null) {
			throw new AppException(HttpStatus.NOT_FOUND, "그 매듭을 찾을 수 없어요.");
		}

		User user = userMapper.findByEmail(email);
		if (knot.getUserId().equals(user.getId())) {
			throw new AppException(HttpStatus.FORBIDDEN, "본인이 풀어놓은 매듭에는 공감을 보낼 수 없어요.");
		}

		ReactionModerationResult moderation = claudeService.moderateReaction(validated);
		if (!moderation.isApproved()) {
			throw new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "지금은 이 공감을 보낼 수 없어요.");
		}

		ForestReaction reaction = new ForestReaction();
		reaction.setForestKnotId(forestKnotId);
		reaction.setUserId(user.getId());
		reaction.setActionText(moderation.getActionText());
		forestReactionMapper.insert(reaction);

		return reaction;
	}

	private String validateReactionText(String actionText) {
		if (actionText == null || actionText.isBlank()) {
			throw new AppException(HttpStatus.BAD_REQUEST, "공유할 다짐을 입력해주세요.");
		}
		String trimmed = actionText.trim();
		if (trimmed.length() > MAX_TEXT_LENGTH) {
			throw new AppException(HttpStatus.BAD_REQUEST, "공감 내용은 " + MAX_TEXT_LENGTH + "자 이내로 적어주세요.");
		}
		return trimmed;
	}

	public void scrap(String email, Long forestKnotId) {
		if (forestKnotMapper.findById(forestKnotId) == null) {
			throw new AppException(HttpStatus.NOT_FOUND, "그 매듭을 찾을 수 없어요.");
		}
		User user = userMapper.findByEmail(email);
		if (forestScrapMapper.findByUserAndKnot(user.getId(), forestKnotId) != null) {
			return;
		}

		ForestScrap scrap = new ForestScrap();
		scrap.setUserId(user.getId());
		scrap.setForestKnotId(forestKnotId);
		forestScrapMapper.insert(scrap);
	}

	public ForestScrap getScrap(String email, Long forestKnotId) {
		User user = userMapper.findByEmail(email);
		return forestScrapMapper.findByUserAndKnot(user.getId(), forestKnotId);
	}

	public void unscrap(String email, Long forestKnotId) {
		User user = userMapper.findByEmail(email);
		forestScrapMapper.delete(user.getId(), forestKnotId);
	}

	public void updateScrapMemo(String email, Long forestKnotId, String memo) {
		if (memo != null && memo.trim().length() > MAX_TEXT_LENGTH) {
			throw new AppException(HttpStatus.BAD_REQUEST, "메모는 " + MAX_TEXT_LENGTH + "자 이내로 적어주세요.");
		}
		User user = userMapper.findByEmail(email);
		ForestScrap scrap = forestScrapMapper.findByUserAndKnot(user.getId(), forestKnotId);
		if (scrap == null) {
			throw new AppException(HttpStatus.NOT_FOUND, "스크랩한 매듭이 아니에요.");
		}
		forestScrapMapper.updateMemo(scrap.getId(), memo == null || memo.isBlank() ? null : memo.trim());
	}

	public List<ForestScrap> getMyScraps(String email, String tag) {
		User user = userMapper.findByEmail(email);
		return forestScrapMapper.findAllByUser(user.getId(), tag);
	}
}
