package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_user") // "user" is a reserved word in SQL
public class User extends LockableImpl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "ory_id", unique = true, nullable = false)
    private String oryId;

    @Column(unique = true, nullable = false)
    private String email;
    private String name;
    private String surname;

    @Column(nullable = false)
    private Boolean active=true;
    @Column(nullable = false)
    private Boolean isAdmin=false;

    private String pendingActivationToken;

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOryId() { return oryId; }
    public void setOryId(String oryId) { this.oryId = oryId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }

    public void setActive(Boolean active) { this.active = active; }
    public Boolean getActive() { return active; }

    public void setIsAdmin(Boolean isAdmin) { this.isAdmin = isAdmin; }
    public Boolean getIsAdmin() { return isAdmin; }

    public String getPendingActivationToken() { return pendingActivationToken; }
    public void setPendingActivationToken(String pendingActivationToken) { this.pendingActivationToken = pendingActivationToken; }
}