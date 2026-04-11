package com.y4vra.irboardbackend.application.ports;

import com.y4vra.irboardbackend.domain.model.User;

public interface IdentityService {
    String createIdentity(String email, String name, String surname, boolean isAdmin);
    String sendInvitationCode(String email);
    void validateRecoveryCode(String email, String code, String flowId);
    void setPassword(String oryId, String password, User user);
    void disableIdentity(String oryId);
}