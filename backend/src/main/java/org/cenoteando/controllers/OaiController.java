package org.cenoteando.controllers;

import com.lyncode.xoai.dataprovider.OAIDataProvider;
import com.lyncode.xoai.dataprovider.OAIRequestParameters;
import com.lyncode.xoai.dataprovider.core.XOAIManager;
import com.lyncode.xoai.dataprovider.exceptions.ConfigurationException;
import com.lyncode.xoai.dataprovider.exceptions.InvalidContextException;
import com.lyncode.xoai.dataprovider.exceptions.OAIException;
import com.lyncode.xoai.dataprovider.exceptions.WritingXmlException;
import com.lyncode.xoai.dataprovider.services.api.FilterResolver;
import com.lyncode.xoai.dataprovider.services.api.ResourceResolver;
import com.lyncode.xoai.dataprovider.xml.xoaiconfig.Configuration;
import com.lyncode.xoai.dataprovider.xml.xoaiconfig.ContextConfiguration;
import com.lyncode.xoai.dataprovider.xml.xoaiconfig.FormatConfiguration;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.xml.stream.XMLStreamException;
import org.cenoteando.oai.config.CenoteandoRepositoryConfiguration;
import org.cenoteando.oai.repository.CenoteandoItemRepository;
import org.cenoteando.oai.repository.CenoteandoSetRepository;
import org.cenoteando.oai.resolvers.CenoteandoFilterResolver;
import org.cenoteando.oai.resolvers.CenoteandoResourceResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("oai")
public class OaiController {

    private final Logger log = LoggerFactory.getLogger(OaiController.class);

    @Autowired
    CenoteandoRepositoryConfiguration identify;

    @Autowired
    CenoteandoSetRepository setRepository;

    @Autowired
    CenoteandoItemRepository itemRepository;

    private OAIDataProvider _dataProvider;

    void configure()
        throws ConfigurationException, InvalidContextException, IOException {
        FormatConfiguration formatConfiguration = new FormatConfiguration(
            "oai_datacite"
        )
            .withNamespace("http://schema.datacite.org/oai/oai-1.1/")
            .withPrefix("oai_datacite")
            .withXslt("static/oai/metadataFormats/oai_openaire_CONACyT.xsl")
            .withSchemaLocation(
                "http://schema.datacite.org/oai/oai-1.1 http://schema.datacite.org/oai/oai-1.1/oai.xsd"
            );
        ContextConfiguration contextConfiguration = new ContextConfiguration(
            identify.getBaseUrl()
        )
            .withFormat("oai_datacite")
            .withName("OAI Datacite")
            .withDescription("OAI Datacite context");
        Configuration config = new Configuration()
            .withFormatConfigurations(formatConfiguration)
            .withContextConfigurations(contextConfiguration)
            .withIndented(true);

        FilterResolver filterResolver = new CenoteandoFilterResolver();
        ResourceResolver resourceResolver = new CenoteandoResourceResolver();
        // TODO: Get configuration from file (check if it works)
        // Configuration config = Configuration.readConfiguration(resourceResolver.getResource("xoai.xml"));
        XOAIManager manager = new XOAIManager(
            filterResolver,
            resourceResolver,
            config
        );

        _dataProvider =
            new OAIDataProvider(
                manager,
                identify.getBaseUrl(),
                identify,
                setRepository,
                itemRepository
            );
    }

    @RequestMapping(
        value = "request",
        method = { RequestMethod.GET, RequestMethod.POST },
        produces = "application/xml"
    )
    public StreamingResponseBody request(
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String until,
        @RequestParam(required = false) String set,
        @RequestParam String verb,
        @RequestParam(required = false) String metadataPrefix,
        @RequestParam(required = false) String identifier,
        @RequestParam(required = false) String resumptionToken
    ) {
        log.debug("Reading parameters from request");
        Map<String, List<String>> params = new HashMap<>();
        params.put("from", Collections.singletonList(from));
        params.put("until", Collections.singletonList(until));
        params.put("set", Collections.singletonList(set));
        params.put("verb", Collections.singletonList(verb));
        params.put("metadataPrefix", Collections.singletonList(metadataPrefix));
        params.put("identifier", Collections.singletonList(identifier));
        params.put(
            "resumptionToken",
            Collections.singletonList(resumptionToken)
        );

        OAIRequestParameters parameters = new OAIRequestParameters(params);

        return out -> {
            try {
                _dataProvider.handle(parameters, out);
            } catch (
                OAIException | XMLStreamException | WritingXmlException e
            ) {
                // TODO: check errors are being correctly handled (maybe should return OAI-PMH specific errors)
                log.error(e.getMessage(), e);
                throw new IOException(e);
            } finally {
                out.flush();
                out.close();
            }
        };
    }

    @EventListener
    public void onApplicationEvent(ContextRefreshedEvent event)
        throws ConfigurationException, InvalidContextException, IOException {
        log.debug("Configuring OAI-PMH");
        configure();
    }
}
