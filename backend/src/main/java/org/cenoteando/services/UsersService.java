package org.cenoteando.services;

import java.io.IOException;
import org.cenoteando.models.AuthDetails;
import org.cenoteando.models.User;
import org.cenoteando.repository.UsersRepository;
import org.json.CDL;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsersService implements UserDetailsService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public Page<User> getUsers(Pageable pageable) {
        return this.usersRepository.findAll(pageable);
    }

    public User getUser(String id) {
        return this.usersRepository.findByArangoId("Users/" + id);
    }

    public User getUserByEmail(String email) {
        return this.usersRepository.findByEmail(email);
    }

    public User createUser(User user) throws Exception {
        if (userExists(user.getEmail())) throw new Exception(
            "User with email " + user.getEmail() + " already exists!"
        );

        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));

        return this.usersRepository.save(user);
    }

    public User updateUser(String id, User user) {
        User oldUser = getUser(id);
        oldUser.merge(user);
        return this.usersRepository.save(oldUser);
    }

    public void deleteUser(String id) {
        this.usersRepository.deleteById(id);
    }

    @Override
    public AuthDetails loadUserByUsername(String email)
        throws UsernameNotFoundException {
        User user = this.usersRepository.findByEmail(email);
        AuthDetails auth = new AuthDetails(user);
        return auth;
    }

    public boolean userExists(String email) {
        return usersRepository.existsByEmail(email);
    }

    public String toCsv() throws IOException {
        Iterable<User> data = usersRepository.findAll();

        JSONArray objs = new JSONArray();
        JSONArray names = User.getHeaders();
        for (User user : data) {
            objs.put(new JSONObject(user));
        }
        return CDL.rowToString(names) + CDL.toString(names, objs);
    }
}
