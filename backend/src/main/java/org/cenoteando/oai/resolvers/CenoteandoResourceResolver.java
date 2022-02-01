package org.cenoteando.oai.resolvers;

import com.lyncode.xoai.dataprovider.services.api.ResourceResolver;
import org.springframework.core.io.ClassPathResource;

import javax.xml.transform.*;
import javax.xml.transform.stream.StreamSource;
import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;
import java.util.Properties;

public class CenoteandoResourceResolver implements ResourceResolver {
    private static final TransformerFactory transformerFactory = TransformerFactory.newInstance();

    @Override
    public InputStream getResource(String path) throws IOException
    {
        return new ClassPathResource(path).getInputStream();
    }

    @Override
    public Transformer getTransformer(String path) throws IOException,
            TransformerConfigurationException
    {
        Source mySrc = new StreamSource(getResource(path));
        mySrc.setSystemId(path);
        return transformerFactory.newTransformer(mySrc);
    }
}
