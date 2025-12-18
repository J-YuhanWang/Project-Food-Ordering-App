package io.github.j_yuhanwang.food_ordering_app.auth_users.entity;/*
 * @author BlairWang
 * @Date 14/12/2025 6:50 pm
 * @Version 1.0
 */


import io.github.j_yuhanwang.food_ordering_app.cart.entity.Cart;
import io.github.j_yuhanwang.food_ordering_app.order.entity.Order;
import io.github.j_yuhanwang.food_ordering_app.payment.entity.Payment;
import io.github.j_yuhanwang.food_ordering_app.role.entity.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity //JPA需要，告诉hibernate此类是需要持久化到数据库的entity
@AllArgsConstructor //有参构造
@NoArgsConstructor //无参构造
@Data //@ToString,@EqualsAndHashCode,@Getter,@Setter <= toString(),equals(),hash(),getXx(),setXx()
@Builder //建造者模式，replace the new method to create the instances
@Table(name = "users") //Java对象会跟数据库的哪张表做映射；
public class User {
    @Id //JPA通过这个Annotation来识别entity的primary key

    //放在 @Id 字段的下方，作为主键生成方式的补充说明。告诉 JPA 不要让 Java 代码来设置主键，而是由数据库来负责生成。
    //对应SQL中的auto_increment
    @GeneratedValue(strategy = GenerationType.IDENTITY)//可以规定id的生成策略
    //@Column(name="id")表的字段名和Java中属性名一致的话，此行不用写
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    @NotBlank(message="password is required")
    private String password;

    private String phoneNumber;

    private String profileUrl;

    private String address;

    private boolean isActive;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name="user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private List<Role> roles;

    @OneToMany(mappedBy = "user",cascade = CascadeType.ALL)
    private List<Order> orders;

    @OneToMany(mappedBy = "user",cascade = CascadeType.ALL)
    private List<Payment> payments;

    @OneToOne(mappedBy = "user",cascade = CascadeType.ALL)
    private Cart cart;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
