package org.cenoteando.utils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.arangodb.springframework.core.geo.GeoJsonPoint;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import org.cenoteando.models.CenoteGeoJSON;

public class CsvImportExport {

    private CsvImportExport() {}

    public static List<String> stringToList(String value) {
        if (value == null || value.equals("[]")) return new ArrayList<>();
        value = value.substring(1, value.length() - 1);
        String[] values = value.split(",");

        return new ArrayList<>(Arrays.asList(values));
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
