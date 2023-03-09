package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.*;
import static org.cenoteando.models.User.Role.ADMIN;
import static org.cenoteando.models.User.Role.RESEARCHER;

import java.util.ArrayList;
import java.util.List;
import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.impexp.*;
import org.cenoteando.models.*;
import org.cenoteando.repository.CenotesRepository;
import org.cenoteando.repository.CommentBucketRepository;
import org.cenoteando.repository.ReferencesCenoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
            case ADMIN, RESEARCHER:
                return cenoteRepository.findAll(page);
            case CENOTERO_ADVANCED:
                user.setCenoteBlackList(new ArrayList<>());
                return cenoteRepository.findByBlackListFilter(
                    page,
                    user.getCenoteBlackList()
                );
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

    public Iterable<Cenote> getCenotesCsv() {
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();

        if (
            auth instanceof AnonymousAuthenticationToken
        ) return cenoteRepository.findCenotesByTouristicIsTrue();

        User user = (User) auth.getPrincipal();

        switch (user.getRole()) {
            case ADMIN, RESEARCHER:
                return cenoteRepository.findAll();
            case CENOTERO_ADVANCED:
                user.setCenoteBlackList(new ArrayList<>());
                return cenoteRepository.findByBlackListFilterCsv(
                    user.getCenoteBlackList()
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
        Iterable<Cenote> data = getCenotesCsv();

        ExportCSV exp = new ExportCSV(data, "CENOTE");
        return exp.export();
    }

    public List<DomainEntity> fromCsv(MultipartFile multipartfile) {

        ImportCSV importCSV = new ImportCSVCenotes(this);
        return importCSV.importFile(multipartfile);
    }

    public boolean hasReadAccess(String id) {
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();

        if (auth instanceof AnonymousAuthenticationToken) {
            Cenote cenote = cenoteRepository.findByArangoId("Cenotes/" + id);
            return cenote.getTouristic();
        }

        User user = (User) auth.getPrincipal();

        switch (user.getRole()) {
            case ADMIN, RESEARCHER:
                return true;
            case CENOTERO_ADVANCED:
                return !user.getCenoteBlackList().contains(id);
            case CENOTERO_BASIC:
                return user.getCenoteWhiteList().contains(id);
            default:
                return false;
        }
    }

    public boolean hasCreateAccess(User user) {
        return user.getRole() == ADMIN || user.getRole() == RESEARCHER;
    }

    public boolean hasUpdateAccess(User user, String id) {
        switch (user.getRole()) {
            case ADMIN, RESEARCHER:
                return true;
            case CENOTERO_ADVANCED:
                return user.getCenoteWhiteList().contains(id);
            default:
                return false;
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
