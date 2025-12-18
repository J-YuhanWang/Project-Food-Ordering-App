package io.github.j_yuhanwang.food_ordering_app.category.entity;/*
 * @author BlairWang
 * @Date 17/12/2025 8:31 pm
 * @Version 1.0
 */

import io.github.j_yuhanwang.food_ordering_app.menu.entity.Menu;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Builder
@Table(name="categoryies")
@AllArgsConstructor
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;//Asian,Africa,European

    private String description;

    @OneToMany(mappedBy = "category",cascade = CascadeType.ALL)
    private List<Menu> menus;
}
