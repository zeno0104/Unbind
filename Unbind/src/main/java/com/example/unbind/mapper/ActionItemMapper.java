package com.example.unbind.mapper;

import com.example.unbind.domain.ActionItem;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ActionItemMapper {
	void insert(ActionItem actionItem);
}