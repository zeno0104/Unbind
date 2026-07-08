package com.example.unbind.controller;

import com.example.unbind.domain.ForestKnot;
import com.example.unbind.domain.ForestReaction;
import com.example.unbind.domain.ForestScrap;
import com.example.unbind.service.ForestService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/forest")
@RequiredArgsConstructor
public class ForestController {
	private final ForestService forestService;

	@PostMapping("/share")
	public ForestKnot share(Authentication authentication, @RequestBody ShareRequest request) {
		return forestService.shareToForest(authentication.getName(), request.getActionItemId());
	}

	@GetMapping("/knots")
	public List<ForestKnot> getKnots(Authentication authentication, @RequestParam(required = false) String tag,
			@RequestParam(required = false) String q, @RequestParam(defaultValue = "0") int page) {
		return forestService.getForestKnots(authentication.getName(), tag, q, page);
	}

	@DeleteMapping("/knots/{id}")
	public void withdrawKnot(Authentication authentication, @PathVariable("id") Long id) {
		forestService.withdrawKnot(authentication.getName(), id);
	}

	@GetMapping("/knots/{id}/reactions")
	public List<ForestReaction> getReactions(Authentication authentication, @PathVariable("id") Long id) {
		return forestService.getReactions(authentication.getName(), id);
	}

	@PostMapping("/knots/{id}/reactions")
	public ForestReaction addReaction(Authentication authentication, @PathVariable("id") Long id,
			@RequestBody ReactionRequest request) {
		return forestService.addReaction(authentication.getName(), id, request.getActionText());
	}

	@PutMapping("/reactions/{id}")
	public ForestReaction updateReaction(Authentication authentication, @PathVariable("id") Long id,
			@RequestBody ReactionRequest request) {
		return forestService.updateReaction(authentication.getName(), id, request.getActionText());
	}

	@DeleteMapping("/reactions/{id}")
	public void deleteReaction(Authentication authentication, @PathVariable("id") Long id) {
		forestService.deleteReaction(authentication.getName(), id);
	}

	@GetMapping("/knots/{id}/scrap")
	public ForestScrap getScrap(Authentication authentication, @PathVariable("id") Long id) {
		return forestService.getScrap(authentication.getName(), id);
	}

	@PostMapping("/knots/{id}/scrap")
	public void scrap(Authentication authentication, @PathVariable("id") Long id) {
		forestService.scrap(authentication.getName(), id);
	}

	@DeleteMapping("/knots/{id}/scrap")
	public void unscrap(Authentication authentication, @PathVariable("id") Long id) {
		forestService.unscrap(authentication.getName(), id);
	}

	@PutMapping("/knots/{id}/scrap/memo")
	public void updateScrapMemo(Authentication authentication, @PathVariable("id") Long id,
			@RequestBody ScrapMemoRequest request) {
		forestService.updateScrapMemo(authentication.getName(), id, request.getMemo());
	}

	@GetMapping("/scraps")
	public List<ForestScrap> getMyScraps(Authentication authentication, @RequestParam(required = false) String tag) {
		return forestService.getMyScraps(authentication.getName(), tag);
	}

	@Data
	public static class ShareRequest {
		private Long actionItemId;
	}

	@Data
	public static class ReactionRequest {
		private String actionText;
	}

	@Data
	public static class ScrapMemoRequest {
		private String memo;
	}
}
