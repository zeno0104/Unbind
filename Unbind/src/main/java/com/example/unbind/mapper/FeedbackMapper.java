package com.example.unbind.mapper;

import com.example.unbind.domain.Feedback;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface FeedbackMapper {
	void insert(Feedback feedback);

	List<Feedback> findAllWithUserEmail();
}
