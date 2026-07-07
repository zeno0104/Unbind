package com.example.unbind.service;

import com.example.unbind.domain.ActionItem;
import com.example.unbind.domain.Constellation;
import com.example.unbind.domain.ConstellationName;
import com.example.unbind.domain.User;
import com.example.unbind.mapper.ActionItemMapper;
import com.example.unbind.mapper.ConstellationNameMapper;
import com.example.unbind.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

	private static final String UNTAGGED = "기타";

	private final ActionItemMapper actionItemMapper;
	private final ConstellationNameMapper constellationNameMapper;
	private final UserMapper userMapper;

	public List<Constellation> getConstellations(String email) {
		User user = userMapper.findByEmail(email);
		List<ActionItem> knots = actionItemMapper.findAllByUserId(user.getId());

		Map<String, List<ActionItem>> grouped = knots.stream()
				.collect(Collectors.groupingBy(
						k -> k.getRelationshipTag() == null || k.getRelationshipTag().isBlank() ? UNTAGGED
								: k.getRelationshipTag()));

		Map<String, String> names = constellationNameMapper.findAllByUserId(user.getId()).stream()
				.collect(Collectors.toMap(ConstellationName::getTag, ConstellationName::getName));

		List<Constellation> constellations = new ArrayList<>();
		for (Map.Entry<String, List<ActionItem>> group : grouped.entrySet()) {
			Constellation c = new Constellation();
			c.setTag(group.getKey());
			c.setName(names.get(group.getKey()));
			c.setKnots(group.getValue());
			c.setCompleted(group.getValue().stream()
					.allMatch(k -> k.getIsCompleted() != null && k.getIsCompleted() == 1));
			constellations.add(c);
		}

		constellations.sort(Comparator.comparingInt((Constellation c) -> c.getKnots().size()).reversed());
		return constellations;
	}

	public void renameConstellation(String email, String tag, String name) {
		User user = userMapper.findByEmail(email);
		constellationNameMapper.upsert(user.getId(), tag, name);
	}
}
