package org.cenoteando.utils;

import com.arangodb.springframework.core.geo.GeoJsonPoint;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.cenoteando.models.CenoteGeoJSON;
import org.json.JSONArray;

public class CsvImportExport {

    private CsvImportExport() {}

    public static List<String> stringToList(String value) {
        if (value == null || value.equals("[]")) return new ArrayList<>();
        value = value.substring(1, value.length() - 1);
        String[] values = value.split(",");

        return new ArrayList<>(Arrays.asList(values));
    }

    public static String rowToString(JSONArray ja) {
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < ja.length(); ++i) {
            if (i > 0) {
                sb.append(',');
            }

            Object object = ja.opt(i);

            //quotes in strings for csv files
            if (object != null && object instanceof String string) {
                sb.append('"');
                int length = string.length();

                for (int j = 0; j < length; ++j) {
                    char c = string.charAt(j);
                    if (c >= ' ' && c != '"') {
                        sb.append(c);
                    }
                }

                sb.append('"');
            } else if (object != null) {
                String string = object.toString();
                if (
                    string.length() > 0 &&
                    (
                        string.indexOf(44) >= 0 ||
                        string.indexOf(10) >= 0 ||
                        string.indexOf(13) >= 0 ||
                        string.indexOf(0) >= 0 ||
                        string.charAt(0) == '"'
                    )
                ) {
                    sb.append('"');
                    int length = string.length();

                    for (int j = 0; j < length; ++j) {
                        char c = string.charAt(j);
                        if (c >= ' ' && c != '"') {
                            sb.append(c);
                        }
                    }

                    sb.append('"');
                } else {
                    sb.append(string);
                }
            }
        }

        sb.append('\n');
        return sb.toString();
    }

    public static class CenoteGeoJsonDeserialize
        extends JsonDeserializer<CenoteGeoJSON> {

        @Override
        public CenoteGeoJSON deserialize(
            JsonParser parser,
            DeserializationContext deserializationContext
        ) throws IOException {
            JsonNode rootNode = parser.getCodec().readTree(parser);
            JsonNode type = rootNode.get("type");
            JsonNode geometry = rootNode.get("geometry");
            JsonNode coordinates = geometry.get("coordinates");
            String gsonType = geometry.get("type").asText();

            if (gsonType.equals("Point")) {
                GeoJsonPoint point = new GeoJsonPoint(
                    coordinates.get(0).asDouble(),
                    coordinates.get(1).asDouble()
                );
                return new CenoteGeoJSON(point, type.asText());
            }
            return null;
        }
    }
}
