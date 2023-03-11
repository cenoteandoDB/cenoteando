package org.cenoteando.utils;

import com.arangodb.springframework.core.geo.GeoJsonPoint;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import org.cenoteando.models.CenoteGeoJSON;

public class CsvImportExport {

    private CsvImportExport() {}

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
