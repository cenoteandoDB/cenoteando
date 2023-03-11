package org.cenoteando.impexp;

import org.apache.commons.io.IOUtils;
import static org.apache.commons.lang3.StringUtils.isEmpty;

import org.apache.commons.lang3.StringUtils;
import org.cenoteando.exceptions.CenoteandoException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.cenoteando.exceptions.ErrorMessage.READ_FILE;

public abstract class ImportCSV{

    public List<DomainEntity> importFile(MultipartFile file){
        List<DomainEntity> entities = new ArrayList<>();

        List<String[]> lines = parseCsv(file);

        csvToObject(lines, entities);

        return saveDB(entities);
    }

    private List<String[]> parseCsv(MultipartFile file){
        ArrayList<String[]> lines = new ArrayList<>();
        try{
            InputStream inputStream = file.getInputStream();
            IOUtils.readLines(inputStream, StandardCharsets.UTF_8)
                    .forEach(line -> lines.add(StringUtils.splitByWholeSeparatorPreserveAllTokens(line, ";")));
        } catch (IOException e) {
            throw new CenoteandoException(READ_FILE);
        }
        lines.remove(0);
        return lines;
    }
    abstract void csvToObject(List<String[]> lines, List<DomainEntity> entities);

    protected void checkValid(DomainEntity entity){
        if(!entity.validate()){
            //Throw error
        }
    }

    abstract List<DomainEntity> saveDB(List<DomainEntity> entities);

    public static List<String> toList(String value) {
        if (isEmpty(value)){
            return new ArrayList<>();
        }
        return Arrays.stream(value.split("\\|")).toList();
    }
}
