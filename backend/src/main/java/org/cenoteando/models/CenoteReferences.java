package org.cenoteando.models;

import com.arangodb.springframework.annotation.Edge;
import com.arangodb.springframework.annotation.From;
import com.arangodb.springframework.annotation.To;

@Edge("references_cenotes")
public class CenoteReferences {

    @To
    private Cenote cenote;

    @From
    private Reference reference;


    public CenoteReferences() {}

    public Cenote getCenote() {
        return cenote;
    }

    public Reference getReference() {
        return reference;
    }

}
