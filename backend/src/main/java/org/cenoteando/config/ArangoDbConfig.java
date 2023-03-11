package org.cenoteando.config;

import com.arangodb.ArangoDB;
import com.arangodb.springframework.annotation.EnableArangoAuditing;
import com.arangodb.springframework.annotation.EnableArangoRepositories;
import com.arangodb.springframework.config.ArangoConfiguration;
import org.cenoteando.models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;

@Configuration
@EnableArangoAuditing(auditorAwareRef = "auditorProvider")
@EnableArangoRepositories(basePackages = { "org.cenoteando.repository" })
public class ArangoDbConfig implements ArangoConfiguration {

    @Value("${arango.host:localhost}")
    private String hostname;

    @Value("${arango.port:8529}")
    private String port;

    @Value("${arango.db:_system}")
    private String db;

    @Value("${arango.user:root}")
    private String user;

    @Value("${arango.password:#{null}}")
    private String password;

    @Override
    public ArangoDB.Builder arango() {
        return new ArangoDB.Builder()
            .host(hostname, Integer.parseInt(port))
            .user(user)
            .password(password);
    }

    @Override
    public String database() {
        return db;
    }

    @Bean
    public AuditorAware<User> auditorProvider() {
        return new AuditorProvider();
    }
}
