package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.*;
import static org.cenoteando.models.User.Role.ADMIN;
import static org.cenoteando.models.User.Role.CENOTERO_ADVANCED;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.models.*;
import org.cenoteando.repository.CenotesRepository;
import org.cenoteando.repository.CommentBucketRepository;
import org.cenoteando.repository.ReferencesCenoteRepository;
import org.cenoteando.utils.CsvImportExport;
import org.json.CDL;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvBeanReader;
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.prefs.CsvPreference;

@Service
public class CenoteService {

    @Autowired
    private ReferencesCenoteRepository referencesCenoteRepository;

    @Autowired
    private CenotesRepository cenoteRepository;

    @Autowired
    private GadmService gadmService;

    @Autowired
    private CommentBucketRepository commentBucketRepository;

    public Page<Cenote> getCenotes(Pageable page) {
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();

        if (
            auth instanceof AnonymousAuthenticationToken
        ) return cenoteRepository.findCenotesByTouristicIsTrue(page);

        User user = (User) auth.getPrincipal();

        switch (user.getRole()) {
            case ADMIN:
            case CENOTERO_ADVANCED:
                return cenoteRepository.findAll(page);
            case CENOTERO_BASIC:
                if (user.getCenoteWhiteList() == null) user.setCenoteWhiteList(
                    new ArrayList<>()
                );
                return cenoteRepository.findByWhiteListFilter(
                    page,
                    user.getCenoteWhiteList()
                );
            default:
                return null;
        }
    }

    public Cenote getCenote(String id) {
        Cenote cenote = cenoteRepository.findByArangoId("Cenotes/" + id);
        if (!hasReadAccess(id)) throw new CenoteandoException(
            READ_ACCESS,
            "CENOTE",
            id
        );
        return cenote;
    }

    public Cenote createCenote(Cenote cenote) {
        if (!cenote.validate()) throw new CenoteandoException(INVALID_FORMAT);

        Gadm gadm = gadmService.findGadm(cenote.getGeojson().getGeometry());
        cenote.setGadm(gadm);

        //TODO use if needed
        /*User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        cenote.setCreator(user);*/

        return cenoteRepository.save(cenote);
    }

    public Cenote updateCenote(String id, Cenote cenote) {
        if (!cenote.validate()) throw new CenoteandoException(INVALID_FORMAT);
        Cenote oldCenote = this.getCenote(id);

        if (
            !cenote.getGeojson().equals(oldCenote.getGeojson())
        ) oldCenote.setGadm(
            gadmService.findGadm(cenote.getGeojson().getGeometry())
        );

        oldCenote.merge(cenote);
        return cenoteRepository.save(oldCenote);
    }

    public void deleteCenote(String id) {
        try {
            cenoteRepository.deleteById(id);
        } catch (Exception e) {
            throw new CenoteandoException(DELETE_PERMISSION, "CENOTE", id);
        }
    }

    public List<Reference> getCenoteReferences(String id) {
        List<CenoteReferences> result = referencesCenoteRepository.findByCenote(
            "Cenotes/" + id
        );
        return result.stream().map(CenoteReferences::getReference).toList();
    }

    public String toCsv() {
        Iterable<Cenote> data = cenoteRepository.findAll();

        StringBuilder sb = new StringBuilder();
        JSONArray names = Cenote.getHeaders();

        for (Cenote cenote : data) {
            JSONObject obj = new JSONObject(cenote);
            obj.put("social", cenote.getSocial());
            obj.put("geojson", cenote.getGeojson());
            sb.append(CsvImportExport.rowToString(obj.toJSONArray(names)));
        }

        return CDL.rowToString(names) + sb;
    }

    public List<Cenote> fromCsv(MultipartFile multipartfile) {
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();
        User user = (User) auth.getPrincipal();

        ArrayList<Cenote> values = new ArrayList<>();

        try (
            Reader file_reader = new InputStreamReader(
                multipartfile.getInputStream()
            )
        ) {
            ICsvBeanReader reader = new CsvBeanReader(
                file_reader,
                CsvPreference.STANDARD_PREFERENCE
            );
            final String[] header = reader.getHeader(true);
            final CellProcessor[] processors = Cenote.getProcessors();

            Cenote cenote;
            Cenote oldCenote;
            while (
                (cenote = reader.read(Cenote.class, header, processors)) != null
            ) {
                if (!cenote.validate()) throw new CenoteandoException(
                    INVALID_FORMAT
                );

                if ((oldCenote = getCenote(cenote.getId())) != null) {
                    if (
                        !hasUpdateAccess(user, cenote.getId())
                    ) throw new CenoteandoException(
                        UPDATE_PERMISSION,
                        "CENOTE",
                        cenote.getId()
                    );
                    oldCenote.merge(cenote);
                    cenoteRepository.save(oldCenote);
                    values.add(oldCenote);
                } else {
                    if (!hasCreateAccess(user)) throw new CenoteandoException(
                        CREATE_PERMISSION,
                        "CENOTE"
                    );
                    cenoteRepository.save(cenote);
                    values.add(cenote);
                }
            }
        } catch (IOException e) {
            throw new CenoteandoException(READ_FILE);
        }

        return values;
    }

    public boolean hasReadAccess(String id) {
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();
        Cenote cenote = cenoteRepository.findByArangoId("Cenotes/" + id);
        if (auth instanceof AnonymousAuthenticationToken) {
            return cenote.getTouristic();
        }

        User user = (User) auth.getPrincipal();

        switch (user.getRole()) {
            case ADMIN:
            case CENOTERO_ADVANCED:
                return true;
            case CENOTERO_BASIC:
                return cenote.getTouristic() || user.getCenoteWhiteList().contains(id);
            default:
                throw new CenoteandoException(INVALID_ROLE);
        }
    }

    public boolean hasCreateAccess(User user) {
        return user.getRole() == ADMIN || user.getRole() == CENOTERO_ADVANCED;
    }

    public boolean hasUpdateAccess(User user, String id) {
        switch (user.getRole()) {
            case ADMIN:
                return true;
            case CENOTERO_ADVANCED:
                Cenote cenote = cenoteRepository.findByArangoId("Cenotes/" + id);
                return user.getCenoteWhiteList().contains(id) || cenote.isCreator(user);
            case CENOTERO_BASIC:
                return user.getCenoteWhiteList().contains(id);
            default:
                throw new CenoteandoException(INVALID_ROLE);
        }
    }

    public CommentBucket listComments(String id) {
        if (!hasReadAccess(id)) throw new CenoteandoException(
            READ_ACCESS,
            "CENOTE",
            id
        );
        return this.commentBucketRepository.findByCenoteId("Cenotes/" + id);
    }

    public Object getBounds() {
        return this.cenoteRepository.getBounds();
    }
}
