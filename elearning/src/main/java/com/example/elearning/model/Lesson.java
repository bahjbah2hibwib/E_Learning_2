package com.example.elearning.model;

import jakarta.persistence.*;
import lombok.*;

import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "lessons", schema = "elearning", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"section_id", "lesson_order"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Lesson extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lesson_id")
    private Long lessonId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Section section;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "lesson_type", nullable = false, length = 20)
    private String lessonType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "lesson_order", nullable = false)
    private Integer lessonOrder;

}
