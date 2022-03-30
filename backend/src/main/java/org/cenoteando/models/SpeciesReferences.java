package org.cenoteando.models;

import com.arangodb.springframework.annotation.Edge;
import com.arangodb.springframework.annotation.From;
import com.arangodb.springframework.annotation.To;

@Edge("references_species")
public class SpeciesReferences{

    @To
    private Species species;

    @From
    private Reference reference;


    public SpeciesReferences() {}

    public Species getSpecies() {
        return species;
    }

    public Reference getReference() {
        return reference;
    }

}

