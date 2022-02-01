package test.cenoteando.utils;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component("filterGenerator")
public class FilterGenerator {

    public String filter(String col, Map<String, String> params) {

        return params.entrySet().stream()
                .map(it -> {
                    if(it.getValue().equals("true") || it.getValue().equals("false"))
                        return col + "." + it.getKey() + " == " + it.getValue();
                    else
                        return col + "." + it.getKey() + " == '" + it.getValue() + "'";

                })
                .collect(Collectors.joining(" AND "));
    }
}
