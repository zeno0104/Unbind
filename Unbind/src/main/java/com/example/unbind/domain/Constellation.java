package com.example.unbind.domain;

import lombok.Data;
import java.util.List;

@Data
public class Constellation {
	private String tag;
	private String name;
	private boolean completed;
	private List<ActionItem> knots;
}
