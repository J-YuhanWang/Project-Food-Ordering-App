package io.github.j_yuhanwang.food_ordering_app.response;/*
 * @author BlairWang
 * @Date 16/12/2025 6:33 pm
 * @Version 1.0
 */

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

@Data
@Builder //不与数据库直接联系，所以JPA不管，由Lombok接管此类，省略构造方法
@JsonInclude(JsonInclude.Include.NON_NULL)

public class Response<T> {

    private int statusCode; // e.g.,"200", "404"
    private String message; // Additional information about the response
    private T data; // The actual data payload
    private Map<String, Object> meta;
}
