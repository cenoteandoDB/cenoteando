package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.NOT_FOUND;

import com.arangodb.springframework.core.geo.GeoJsonPoint;
import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.models.Gadm;
import org.cenoteando.repository.GadmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GadmService {

    @Autowired
    private GadmRepository gadmRepository;

    /* TODO: Optimize (convert to polyline and only include yucatán peninsula)
    public Gadm coastline() {
        //TODO
        return null;
    }
    */

    // NOTE: Only returns Yucatán, Campeche and Quintana Roo
    public Iterable<Gadm> states() {
        return gadmRepository.getStates();
    }

    // NOTE: Only returns municipalities in Yucatán, Campeche and Quintana Roo
    public Iterable<Gadm> municipalities() {
        return gadmRepository.getMunicipalities();
    }

    public Gadm findGadm(GeoJsonPoint geojson) {
        Gadm gadm = gadmRepository.findGadm(geojson);
        if (gadm == null) throw new CenoteandoException(NOT_FOUND, "GADM");

        return gadm;
    }
}
