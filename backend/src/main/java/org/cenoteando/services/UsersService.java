package org.cenoteando.services;

import static org.cenoteando.exceptions.ErrorMessage.USER_EXISTS;

import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.impexp.ExportCSV;
import org.cenoteando.models.AuthDetails;
import org.cenoteando.models.User;
import org.cenoteando.repository.UsersRepository;
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

    public User createUser(User user) {
        if (userExists(user.getEmail())) throw new CenoteandoException(
            USER_EXISTS
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

    public String toCsv() {
        Iterable<User> data = usersRepository.findAll();

        ExportCSV exp = new ExportCSV(data, "USER");
        return exp.export();
    }
}
