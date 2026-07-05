package com.example.unbind.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.unbind.domain.User;

@Mapper
public interface UserMapper {

	void insert(User user);

	User findByEmail(String email);

}
