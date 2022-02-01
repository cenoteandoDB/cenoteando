package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.arangodb.springframework.annotation.PersistentIndexed;
import org.json.JSONArray;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;


@Document("Users")
public class User {
    public enum Role {CENOTERO, OWNER, REGIONAL_MANAGER, THEMATIC_MANAGER, ADMIN};

    @Id // db document field: _key
    private String id;

    @ArangoId // db document field: _id
    private String arangoId;

    //Unique
    private String email;

    // TODO: Make sure this is not returned to the client at any point
    private String password;

    private Role role;

    // TODO: Add name to Users

    //groups

    @CreatedDate
    @PersistentIndexed
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public User(String email, String password, Role role){
        this.email = email;
        this.password = password;
        this.role = role;
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

    public void setEmail(String email) {
        this.email = email;
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

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public boolean isAdmin(){
        return this.role == Role.ADMIN;
    }

    public static JSONArray getHeaders(){
        return new JSONArray("['id', 'arangoId', 'email', 'role', 'createdAt', 'updatedAt']");
    }
}
