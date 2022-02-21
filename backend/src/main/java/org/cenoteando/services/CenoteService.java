package org.cenoteando.services;

import org.json.CDL;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvBeanReader;
import org.cenoteando.models.*;
import org.cenoteando.repository.CenotesRepository;
import org.cenoteando.repository.CommentBucketRepository;
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.prefs.CsvPreference;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

import static org.cenoteando.models.User.Role.ADMIN;
import static org.cenoteando.models.User.Role.RESEARCHER;


@Service
public class CenoteService {

    @Autowired
    private CenotesRepository cenoteRepository;

    @Autowired
    private GadmService gadmService;

    @Autowired
    private CommentBucketRepository commentBucketRepository;

    public Page<Cenote> getCenotes(Pageable page){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if(auth instanceof AnonymousAuthenticationToken)
            return cenoteRepository.findCenotesByTouristicIsTrue(page);

        User user = (User) auth.getPrincipal();

        switch (user.getRole()){
            case ADMIN:
            case RESEARCHER:
                return cenoteRepository.findAll(page);
            case CENOTERO_ADVANCED:
                user.setCenoteBlackList(new ArrayList<>());
                return cenoteRepository.findByBlackListFilter(page, user.getCenoteBlackList());
            case CENOTERO_BASIC:
                if(user.getCenoteWhiteList() == null)
                    user.setCenoteWhiteList(new ArrayList<>());
                return cenoteRepository.findByWhiteListFilter(page, user.getCenoteWhiteList());
            default:
                return null;
        }
    }

    public Iterable<Cenote> getCenotesCsv(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if(auth instanceof AnonymousAuthenticationToken)
            return cenoteRepository.findCenotesByTouristicIsTrue();

        User user = (User) auth.getPrincipal();

        switch (user.getRole()){
            case ADMIN:
            case RESEARCHER:
                return cenoteRepository.findAll();
            case CENOTERO_ADVANCED:
                user.setCenoteBlackList(new ArrayList<>());
                return cenoteRepository.findByBlackListFilterCsv(user.getCenoteBlackList());
            default:
                return null;
        }
    }

    public Cenote getCenote(String id) throws Exception {
        Cenote cenote = cenoteRepository.findByArangoId("Cenotes/" + id);
        if(!hasReadAccess(id))
            throw new Exception("User forbidden to get cenote " + id);
        return cenote;
    }

    public Cenote createCenote(Cenote cenote) throws Exception {
        if(!cenote.validate())
            throw new Exception("Validation failed for Cenote creation.");

        Gadm gadm = gadmService.findGadm(cenote.getGeojson().getGeometry());
        cenote.setGadm(gadm);

        //TODO use if needed
        /*User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        cenote.setCreator(user);*/

        return cenoteRepository.save(cenote);
    }

    public Cenote updateCenote(String id, Cenote cenote) throws Exception {
        if(!cenote.validate())
            throw new Exception("Validation failed for Cenote update.");
        Cenote oldCenote = this.getCenote(id);

        if(!cenote.getGeojson().equals(oldCenote.getGeojson()))
            oldCenote.setGadm(gadmService.findGadm(cenote.getGeojson().getGeometry()));

        oldCenote.merge(cenote);
        return cenoteRepository.save(oldCenote);
    }

    public void deleteCenote(String id) throws Exception {
        try{
            cenoteRepository.deleteById(id);
        }
        catch (Exception e){
            throw new Exception("Failed to delete cenote.");
        }
    }

    public String toCsv() throws IOException {

        Iterable<Cenote> data = getCenotesCsv();

        JSONArray objs = new JSONArray();
        JSONArray names = Cenote.getHeaders();

        for(Cenote cenote: data){
            JSONObject obj = new JSONObject(cenote);
            obj.put("social", cenote.getSocial());
            obj.put("geojson", cenote.getGeojson());
            objs.put(obj);
        }
        return  CDL.rowToString(names) + CDL.toString(names, objs);
    }

    public List<String> fromCsv(MultipartFile multipartfile) throws Exception {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();

        Reader file_reader = new InputStreamReader(multipartfile.getInputStream());

        ArrayList<String> values = new ArrayList<>();

        ICsvBeanReader reader = new CsvBeanReader(file_reader, CsvPreference.STANDARD_PREFERENCE);

        final String[] header = reader.getHeader(true);
        final CellProcessor[] processors = Cenote.getProcessors();

        Cenote cenote, oldCenote;
        while( (cenote = reader.read(Cenote.class, header, processors)) != null ) {
            if(!cenote.validate()){
                throw new Exception("Validation failed for " + cenote.getId());
            }
            if((oldCenote = getCenote(cenote.getId())) != null) {
                if(!hasUpdateAccess(user, cenote.getId()))
                    throw new Exception("User doesn't have permission to update cenote " + cenote.getId());
                oldCenote.merge(cenote);
                cenoteRepository.save(oldCenote);
            }
            else{
                if(!hasCreateAccess(user, cenote.getId()))
                    throw new Exception("User doesn't have permission to create cenote " + cenote.getId());
                cenoteRepository.save(cenote);
            }
        }

        return values;
    }

    public boolean hasReadAccess(String id){

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if(auth instanceof AnonymousAuthenticationToken){
            Cenote cenote = cenoteRepository.findByArangoId("Cenotes/" + id);
            return cenote.getTouristic();
        }

        User user = (User) auth.getPrincipal();

        switch (user.getRole()){
            case ADMIN:
            case RESEARCHER:
                return true;
            case CENOTERO_ADVANCED:
                return !user.getCenoteBlackList().contains(id);
            case CENOTERO_BASIC:
                return user.getCenoteWhiteList().contains(id);
            default:
                return false;
        }
    }

    public boolean hasCreateAccess(User user, String id){
        return user.getRole() == ADMIN || user.getRole() == RESEARCHER;
    }

    public boolean hasUpdateAccess(User user, String id){
        switch (user.getRole()){
            case ADMIN:
            case RESEARCHER:
                return true;
            case CENOTERO_ADVANCED:
                return user.getCenoteWhiteList().contains(id);
            default:
                return false;
        }
    }

    public CommentBucket listComments(String id) throws Exception {
        if(!hasReadAccess(id))
            throw new Exception("User forbidden to get cenote " + id);
        return this.commentBucketRepository.findByCenoteId("Cenotes/" + id);
    }

    public Object getBounds(){
        return this.cenoteRepository.getBounds();
    }

}
