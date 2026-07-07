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
		long total = raw.get("TOTAL") == null ? 0 : ((Number) raw.get("TOTAL")).longValue();
		long completed = raw.get("COMPLETED") == null ? 0 : ((Number) raw.get("COMPLETED")).longValue();
		long good = raw.get("GOOD") == null ? 0 : ((Number) raw.get("GOOD")).longValue();

		int warmth = total == 0 ? 0 : (int) Math.round((completed * 0.6 + good * 0.4) / total * 100);
		return Map.of("warmth", warmth, "total", total, "completed", completed);
	}
}