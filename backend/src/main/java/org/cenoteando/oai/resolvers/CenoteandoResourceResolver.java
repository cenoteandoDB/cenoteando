package org.cenoteando.oai.resolvers;

import java.io.IOException;
import java.io.InputStream;

import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamSource;

import com.lyncode.xoai.dataprovider.services.api.ResourceResolver;

import org.springframework.core.io.ClassPathResource;

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
