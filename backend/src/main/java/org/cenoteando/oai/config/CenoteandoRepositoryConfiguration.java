package org.cenoteando.oai.config;

import com.lyncode.xoai.dataprovider.core.DeleteMethod;
import com.lyncode.xoai.dataprovider.core.Granularity;
import com.lyncode.xoai.dataprovider.services.api.RepositoryConfiguration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import org.cenoteando.repository.CenotesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CenoteandoRepositoryConfiguration
    implements RepositoryConfiguration {

    @Value("${oai.repositoryName}")
    private String _repositoryName;

    @Value("${oai.adminEmail}")
    private String _adminEmail;

    @Value("${oai.baseUrl}")
    private String _baseUrl;

    // TODO: Get from database
    @Value(
        "#{new java.text.SimpleDateFormat(\"yyyy-MM-DD\").parse(\"${oai.earliestDate}\")}"
    )
    private Date _earliestDate;

    // TODO: Understand how descriptions work
    private final List<String> _description = new ArrayList<>();

    @Autowired
    CenotesRepository cenotesRepository;

    @Override
    public String getRepositoryName() {
        return _repositoryName;
    }

    @Override
    public List<String> getAdminEmails() {
        return Collections.singletonList(_adminEmail);
    }

    @Override
    public String getBaseUrl() {
        return _baseUrl;
    }

    @Override
    public Date getEarliestDate() {
        return _earliestDate;
    }

    @Override
    public DeleteMethod getDeleteMethod() {
        return DeleteMethod.NO;
    }

    @Override
    public Granularity getGranularity() {
        return Granularity.Second;
    }

    @Override
    public List<String> getDescription() {
        return _description;
    }
}
