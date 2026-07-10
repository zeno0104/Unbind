package com.example.unbind.service;

import com.example.unbind.domain.ActionItem;
import com.example.unbind.domain.JournalEntry;
import com.example.unbind.domain.PatternInsight;
import com.example.unbind.domain.PatternInsightCache;
import com.example.unbind.domain.PatternInsightResult;
import com.example.unbind.domain.RelationshipInsightCache;
import com.example.unbind.domain.RelationshipReport;
import com.example.unbind.domain.User;
import com.example.unbind.mapper.ActionItemMapper;
import com.example.unbind.mapper.InsightCacheMapper;
import com.example.unbind.mapper.JournalEntryMapper;
import com.example.unbind.mapper.UserMapper;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsightService {

	private static final int MIN_ENTRIES_FOR_INSIGHT = 3;
	private static final int MIN_ENTRIES_FOR_RELATIONSHIP_INSIGHT = 2;

	private final JournalEntryMapper journalEntryMapper;
	private final ActionItemMapper actionItemMapper;
	private final UserMapper userMapper;
	private final ClaudeService claudeService;
	private final InsightCacheMapper insightCacheMapper;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public PatternInsightResult getPatterns(String email) {
		User user = userMapper.findByEmail(email);
		List<JournalEntry> entries = journalEntryMapper.findAllByUserId(user.getId());

		if (entries.size() < MIN_ENTRIES_FOR_INSIGHT) {
			return new PatternInsightResult(false, Collections.emptyList());
		}

		List<ActionItem> actionItems = actionItemMapper.findAllByUserId(user.getId());
		int completedCount = (int) actionItems.stream()
				.filter(a -> a.getIsCompleted() != null && a.getIsCompleted() == 1).count();

		PatternInsightCache cache = insightCacheMapper.findPatternCache(user.getId());
		if (cache != null && cache.getEntryCount() == entries.size() && cache.getCompletedCount() == completedCount) {
			List<PatternInsight> cached = deserializePatterns(cache.getPatternsJson());
			if (cached != null) {
				return new PatternInsightResult(true, cached);
			}
		}

		String summary = buildSummary(entries, actionItems);
		List<PatternInsight> patterns = claudeService.analyzePatterns(summary).getPatterns();
		insightCacheMapper.upsertPatternCache(user.getId(), entries.size(), completedCount,
				serializePatterns(patterns));
		return new PatternInsightResult(true, patterns);
	}

	private String serializePatterns(List<PatternInsight> patterns) {
		try {
			return objectMapper.writeValueAsString(patterns);
		} catch (Exception e) {
			return null;
		}
	}

	private List<PatternInsight> deserializePatterns(String json) {
		if (json == null) {
			return null;
		}
		try {
			return Arrays.asList(objectMapper.readValue(json, PatternInsight[].class));
		} catch (Exception e) {
			return null;
		}
	}

	public List<RelationshipReport> getRelationshipReports(String email) {
		User user = userMapper.findByEmail(email);
		List<JournalEntry> entries = journalEntryMapper.findAllByUserId(user.getId());
		List<ActionItem> actionItems = actionItemMapper.findAllByUserId(user.getId());

		Map<String, List<JournalEntry>> grouped = entries.stream()
				.filter(e -> e.getRelationshipTag() != null && !e.getRelationshipTag().isBlank())
				.collect(Collectors.groupingBy(JournalEntry::getRelationshipTag));

		List<RelationshipReport> reports = new ArrayList<>();
		for (Map.Entry<String, List<JournalEntry>> group : grouped.entrySet()) {
			String tag = group.getKey();
			List<JournalEntry> tagEntries = group.getValue();
			Set<Long> entryIds = tagEntries.stream().map(JournalEntry::getId).collect(Collectors.toSet());
			List<ActionItem> tagActionItems = actionItems.stream().filter(a -> entryIds.contains(a.getEntryId()))
					.collect(Collectors.toList());

			RelationshipReport report = new RelationshipReport();
			report.setTag(tag);
			report.setEntryCount(tagEntries.size());
			report.setActionItemCount(tagActionItems.size());
			report.setCompletedCount(
					(int) tagActionItems.stream().filter(a -> a.getIsCompleted() != null && a.getIsCompleted() == 1)
							.count());
			report.setGoodCount((int) tagActionItems.stream().filter(a -> "GOOD".equals(a.getFeedback())).count());
			report.setNeutralCount(
					(int) tagActionItems.stream().filter(a -> "NEUTRAL".equals(a.getFeedback())).count());
			report.setHardCount((int) tagActionItems.stream().filter(a -> "HARD".equals(a.getFeedback())).count());
			report.setEntries(
					tagEntries.stream().sorted(Comparator.comparing(JournalEntry::getCreatedAt).reversed())
							.collect(Collectors.toList()));

			if (tagEntries.size() >= MIN_ENTRIES_FOR_RELATIONSHIP_INSIGHT) {
				report.setInsight(getRelationshipInsight(user.getId(), tag, tagEntries, tagActionItems,
						report.getCompletedCount()));
			}

			reports.add(report);
		}

		reports.sort(Comparator.comparingInt(RelationshipReport::getEntryCount).reversed());
		return reports;
	}

	private String getRelationshipInsight(Long userId, String tag, List<JournalEntry> tagEntries,
			List<ActionItem> tagActionItems, int completedCount) {
		RelationshipInsightCache cache = insightCacheMapper.findRelationshipCache(userId, tag);
		if (cache != null && cache.getEntryCount() == tagEntries.size()
				&& cache.getCompletedCount() == completedCount) {
			return cache.getInsightText();
		}

		String summary = buildRelationshipSummary(tag, tagEntries, tagActionItems);
		String insight = claudeService.summarizeRelationship(summary);
		insightCacheMapper.upsertRelationshipCache(userId, tag, tagEntries.size(), completedCount, insight);
		return insight;
	}

	private String buildRelationshipSummary(String tag, List<JournalEntry> entries, List<ActionItem> actionItems) {
		StringBuilder sb = new StringBuilder();
		sb.append("[").append(tag).append("와(과)의 상황 기록]\n");
		for (JournalEntry entry : entries) {
			sb.append("- ").append(entry.getSituationText()).append("\n");
		}
		sb.append("\n[다짐과 결과]\n");
		for (ActionItem item : actionItems) {
			String status = item.getIsCompleted() != null && item.getIsCompleted() == 1
					? "완료(" + (item.getFeedback() == null ? "피드백 없음" : item.getFeedback()) + ")"
					: "미완료";
			sb.append("- ").append(item.getContent()).append(" [").append(status).append("]\n");
		}
		return sb.toString();
	}

	private String buildSummary(List<JournalEntry> entries, List<ActionItem> actionItems) {
		StringBuilder sb = new StringBuilder();
		sb.append("[상황 기록]\n");
		for (JournalEntry entry : entries) {
			sb.append("- ").append(entry.getSituationText()).append("\n");
		}
		sb.append("\n[다짐과 결과]\n");
		for (ActionItem item : actionItems) {
			String status = item.getIsCompleted() != null && item.getIsCompleted() == 1
					? "완료(" + (item.getFeedback() == null ? "피드백 없음" : item.getFeedback()) + ")"
					: "미완료";
			sb.append("- ").append(item.getContent()).append(" [").append(status).append("]\n");
		}
		return sb.toString();
	}
}
