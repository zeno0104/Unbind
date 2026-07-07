package com.example.unbind.controller;

import com.example.unbind.domain.ActionItem;
import com.example.unbind.domain.Constellation;
import com.example.unbind.mapper.ActionItemMapper;
import com.example.unbind.mapper.UserMapper;
import com.example.unbind.service.RoomService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
public class RoomController {
	private final ActionItemMapper actionItemMapper;
	private final UserMapper userMapper;
	private final RoomService roomService;

	@GetMapping("/knots")
	public List<ActionItem> getKnots(Authentication authentication) {
		Long userId = userMapper.findByEmail(authentication.getName()).getId();
		return actionItemMapper.findAllByUserId(userId);
	}

	@GetMapping("/constellations")
	public List<Constellation> getConstellations(Authentication authentication) {
		return roomService.getConstellations(authentication.getName());
	}

	@PatchMapping("/constellations/name")
	public void renameConstellation(Authentication authentication, @RequestBody RenameRequest request) {
		roomService.renameConstellation(authentication.getName(), request.getTag(), request.getName());
	}

	@Data
	public static class RenameRequest {
		private String tag;
		private String name;
	}
}
