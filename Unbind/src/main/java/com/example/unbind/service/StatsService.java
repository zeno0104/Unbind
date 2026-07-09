package com.example.unbind.service;

import com.example.unbind.domain.JournalEntry;
import com.example.unbind.mapper.ActionItemMapper;
import com.example.unbind.mapper.JournalEntryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {
	private final ActionItemMapper actionItemMapper;
	private final JournalEntryMapper journalEntryMapper;

	public Map<String, Object> getWarmthStats(Long userId) {
		Map<String, Object> raw = actionItemMapper.countStats(userId);
		long total = raw.get("total") == null ? 0 : ((Number) raw.get("total")).longValue();
		long completed = raw.get("completed") == null ? 0 : ((Number) raw.get("completed")).longValue();
		long good = raw.get("good") == null ? 0 : ((Number) raw.get("good")).longValue();

		int warmth = total == 0 ? 0 : (int) Math.round((completed * 0.6 + good * 0.4) / total * 100);

		Map<String, Object> result = new HashMap<>();
		result.put("warmth", warmth);
		result.put("total", total);
		result.put("completed", completed);
		result.put("streak", getStreak(userId));
		return result;
	}

	private int getStreak(Long userId) {
		List<JournalEntry> entries = journalEntryMapper.findAllByUserId(userId);
		Set<LocalDate> daysWithEntry = entries.stream()
				.map(entry -> entry.getCreatedAt().toLocalDate())
				.collect(Collectors.toSet());

		LocalDate cursor = LocalDate.now();
		if (!daysWithEntry.contains(cursor)) {
			cursor = cursor.minusDays(1);
		}

		int streak = 0;
		while (daysWithEntry.contains(cursor)) {
			streak++;
			cursor = cursor.minusDays(1);
		}
		return streak;
	}
}