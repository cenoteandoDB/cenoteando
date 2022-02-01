package org.cenoteando.utils;

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
            return null;
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
}
