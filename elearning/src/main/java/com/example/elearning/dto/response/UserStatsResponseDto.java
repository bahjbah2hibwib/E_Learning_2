package com.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponseDto {
    private Long total;
    private Long activeStudents;
    private Long totalInstructors;
    private Long newUsers;
}
