package org.cenoteando.oai.model;

public class CenoteandoContributor {

    // TODO: Convert type to enum?
    private String type;
    private String name;
    private String id;

    public CenoteandoContributor(String type, String name, String id) {
        this.type = type;
        this.name = name;
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public String getName() {
        return name;
    }

    public String getId() {
        return id;
    }
}
