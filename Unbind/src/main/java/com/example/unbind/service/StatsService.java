package com.example.unbind.service;

import com.example.unbind.mapper.ActionItemMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {
	private final ActionItemMapper actionItemMapper;

	public Map<String, Object> getWarmthStats(Long userId) {
		Map<String, Object> raw = actionItemMapper.countStats(userId);
		long total = raw.get("total") == null ? 0 : ((Number) raw.get("total")).longValue();
		long completed = raw.get("completed") == null ? 0 : ((Number) raw.get("completed")).longValue();
		long good = raw.get("good") == null ? 0 : ((Number) raw.get("good")).longValue();

		int warmth = total == 0 ? 0 : (int) Math.round((completed * 0.6 + good * 0.4) / total * 100);
		return Map.of("warmth", warmth, "total", total, "completed", completed);
	}
}