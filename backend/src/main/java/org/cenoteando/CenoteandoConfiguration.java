package org.cenoteando;

import com.arangodb.ArangoDB;
import com.arangodb.springframework.annotation.EnableArangoAuditing;
import com.arangodb.springframework.annotation.EnableArangoRepositories;
import com.arangodb.springframework.config.ArangoConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableArangoAuditing
@EnableArangoRepositories(basePackages = {"org.cenoteando.repository"})
public class CenoteandoConfiguration implements ArangoConfiguration {

    @Value("${arango.host:localhost}")
    private String _hostname;

    @Value("${arango.port:8529}")
    private String _port;

    @Value("${arango.db:_system}")
    private String _db;

    @Override
    public ArangoDB.Builder arango() {
        return new ArangoDB.Builder()
                .host(_hostname, Integer.parseInt(_port));
    }

    @Override
    public String database() {
        return _db;
    }
}