package org.cenoteando.utils;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component("filterGenerator")
public class FilterGenerator {

    public String filter(String col, Map<String, String> params) {
        return params
            .entrySet()
            .stream()
            .map(it -> {
                if (
                    it.getValue().equals("true") || it.getValue().equals("false")
                ) return (col + "." + it.getKey() + " == " + it.getValue()); else return (
                    col + "." + it.getKey() + " == '" + it.getValue() + "'"
                );
            })
            .collect(Collectors.joining(" AND "));
    }
}
