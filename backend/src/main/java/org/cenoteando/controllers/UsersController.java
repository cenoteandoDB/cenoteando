package org.cenoteando.controllers;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.cenoteando.models.User;
import org.cenoteando.services.UsersService;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController()
@RequestMapping("/api/users")
public class UsersController {

    private final UsersService usersService;

    public UsersController(UsersService usersService) {
        this.usersService = usersService;
    }

    @GetMapping()
    public Iterable<User> getUsers(){
        return usersService.getUsers();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable String id){
        return usersService.getUser(id);
    }

    @PostMapping()
    public User createUser(@RequestBody User user) throws Exception{
        return usersService.createUser(user);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable String id, @RequestBody User user){
        return usersService.updateUser(id,user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String deleteUser(@PathVariable String id){
        usersService.deleteUser(id);
        return "no content";
    }


    @GetMapping("/csv")
    public String toCsv(HttpServletResponse response) throws IOException, IllegalAccessException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=users.csv");

        return usersService.toCsv();
    }
}
