package com.example.unbind.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatternInsightResult {
	private boolean hasEnoughData;
	private List<PatternInsight> patterns;
}
