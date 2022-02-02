package org.cenoteando.services;

import com.arangodb.springframework.core.geo.GeoJson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.cenoteando.models.Gadm;
import org.cenoteando.repository.GadmRepository;

@Service
public class GadmService {

    @Autowired
    private GadmRepository gadmRepository;
/*
    // TODO: Optimize (convert to polyline and only include yucatán peninsula)
    public Gadm coastline(){
        //TODO
        return null;
    }

    // TODO: Optimize (only include Yucatán, Campeche and Quintana Roo)
    public Iterable<Gadm> states(){
        return gadmRepository.findByState("State");
    }

    // TODO: Optimize (only include Yucatán, Campeche and Quintana Roo)
    public Iterable<Gadm> municipalities(){
        return gadmRepository.findByMunicipalities("Municipality");
    }*/

    public Gadm findGadm(GeoJson geojson) throws Exception {
        Gadm gadm = gadmRepository.findGadm(geojson);
        if(gadm == null)
            throw new Exception("Gadm not found. Check cenote geometry.");

        return gadm;
    }
}
