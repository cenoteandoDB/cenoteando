package org.cenoteando.utils;

public class RegisterRequest {

  private String email;
  private String name;
  private String password;

  public RegisterRequest() {}

  public RegisterRequest(String email, String password, String name) {
    this.email = email;
    this.password = password;
    this.name = name;
  }

  public String getEmail() {
    return email;
  }

  public String getPassword() {
    return password;
  }

  public String getName() {
    return name;
  }

  public void validatePassword() throws Exception {
    if (password == null) throw new Exception("Password required");
    if (password.isEmpty()) throw new Exception("Password cannot be empty");
    if (password.length() < 6) throw new Exception(
      "Password should have at least 6 characters"
    );
  }
}
