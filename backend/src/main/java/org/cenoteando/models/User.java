package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.arangodb.springframework.annotation.PersistentIndexed;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.cenoteando.impexp.DomainEntity;
import org.cenoteando.impexp.Visitor;
import org.json.JSONArray;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

@Document("Users")
public class User extends DomainEntity {

    public enum Role {
        ADMIN,
        RESEARCHER,
        CENOTERO_ADVANCED,
        CENOTERO_BASIC,
    }

    @Id // db document field: _key
    private String id;

    @ArangoId // db document field: _id
    private String arangoId;

    private String name;
    private String email;

    @JsonIgnore
    private String password;

    private Role role;

    private List<String> cenoteBlackList;
    private List<String> cenoteWhiteList;
    private List<String> themesBlackList;
    private List<String> themesWhiteList;

    @CreatedDate
    @PersistentIndexed
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public User(String email, String name, String password, Role role) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public String getArangoId() {
        return arangoId;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public List<String> getCenoteBlackList() {
        if (cenoteBlackList == null) {
            return new ArrayList<>();
        }
        return cenoteBlackList;
    }

    public void setCenoteBlackList(List<String> cenoteBlackList) {
        this.cenoteBlackList = cenoteBlackList;
    }

    public List<String> getCenoteWhiteList() {
        if (cenoteWhiteList == null) {
            return new ArrayList<>();
        }
        return cenoteWhiteList;
    }

    public void setCenoteWhiteList(List<String> cenoteWhiteList) {
        this.cenoteWhiteList = cenoteWhiteList;
    }

    public List<String> getThemesBlackList() {
        if (themesBlackList == null) return new ArrayList<>();
        return themesBlackList;
    }

    public void setThemesBlackList(List<String> themesBlackList) {
        this.themesBlackList = themesBlackList;
    }

    public List<String> getThemesWhiteList() {
        if (themesWhiteList == null) return new ArrayList<>();
        return themesWhiteList;
    }

    public void setThemesWhiteList(List<String> themesWhiteList) {
        this.themesWhiteList = themesWhiteList;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public boolean isAdmin() {
        return this.role == Role.ADMIN;
    }

    public void merge(User user) {
        role = user.getRole();
        cenoteBlackList = user.getCenoteBlackList();
        cenoteWhiteList = user.getCenoteWhiteList();
        themesBlackList = user.getThemesBlackList();
        themesWhiteList = user.getThemesWhiteList();
    }

    @Override
    public boolean validate() {
        //TODO implement validate User
        return true;
    }

    @Override
    public void accept(Visitor visitor){
        visitor.visit(this);
    }

}
