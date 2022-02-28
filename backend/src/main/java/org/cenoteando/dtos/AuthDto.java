package org.cenoteando.dtos;

import org.cenoteando.models.User;

public class AuthDto {

  private User user;
  private String accessToken;
  private String tokenType;
  private long expiresIn;

  public AuthDto(User user, String accessToken, String tokenType, long expiresIn) {
    this.user = user;
    this.accessToken = accessToken;
    this.tokenType = tokenType;
    this.expiresIn = expiresIn;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getAccessToken() {
    return accessToken;
  }

  public void setAccessToken(String accessToken) {
    this.accessToken = accessToken;
  }

  public String getTokenType() {
    return tokenType;
  }

  public void setTokenType(String tokenType) {
    this.tokenType = tokenType;
  }

  public long getExpiresIn() {
    return expiresIn;
  }

  public void setExpiresIn(long expiresIn) {
    this.expiresIn = expiresIn;
  }
}
