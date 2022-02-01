package org.cenoteando.oai.model;

public class CenoteandoContributor {

    // TODO: Convert type to enum?
    private String _type;
    private String _name;
    private String _id;

    public CenoteandoContributor(String type, String name, String id) {
        _type = type;
        _name = name;
        _id = id;
    }

    public String getType() {
        return _type;
    }

    public String getName() {
        return _name;
    }

    public String getId() {
        return _id;
    }
}
