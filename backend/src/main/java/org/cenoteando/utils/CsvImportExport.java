package org.cenoteando.utils;

import com.arangodb.springframework.core.geo.GeoJsonPoint;
import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import org.cenoteando.models.CenoteGeoJSON;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CsvImportExport {

    public static List<String> stringToList(String value) {
        if(value.equals("[]") || value == null)
            return new ArrayList<>();
        value = value.substring(1, value.length() - 1);
        String[] values = value.split(",");

        List<String> list = new ArrayList<>(Arrays.asList(values));
        return list;
    }

    public static File convertMultiPartToFile(MultipartFile file) throws IOException {
        File newFile = new File(file.getOriginalFilename());
        FileOutputStream fos = new FileOutputStream(newFile);
        fos.write(file.getBytes());
        fos.close();
        return newFile;
    }

    public static class CenoteGeoJsonDeserialize extends JsonDeserializer<CenoteGeoJSON> {

        @Override
        public CenoteGeoJSON deserialize(JsonParser parser, DeserializationContext deserializationContext) throws IOException, JacksonException {
            // example using the Tree Model API
            JsonNode rootNode = parser.getCodec().readTree(parser);
            JsonNode type = rootNode.get("type");
            JsonNode geometry = rootNode.get("geometry");
            JsonNode coordinates = geometry.get("coordinates");
            String gson_type = geometry.get("type").asText();

            if(gson_type.equals("Point")){
                GeoJsonPoint point = new GeoJsonPoint(coordinates.get(0).asDouble(), coordinates.get(1).asDouble());
                return new CenoteGeoJSON(point, type.asText());
            }


            return null;
        }
    }
}
