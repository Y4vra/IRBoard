package com.y4vra.irboardbackend.infrastructure.api.rest.errors;

import com.y4vra.irboardbackend.domain.errors.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleValidationException_returns400() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(new Object(), "request");

        bindingResult.addError(
                new FieldError("request", "name", "Name is required")
        );

        Method method = DummyController.class.getMethod("dummy", String.class);

        MethodArgumentNotValidException ex =
                new MethodArgumentNotValidException(
                        new org.springframework.core.MethodParameter(method, 0),
                        bindingResult
                );

        ResponseEntity<Object> response =
                handler.handleValidationException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        Map<?, ?> body = (Map<?, ?>) response.getBody();

        assertThat(body.get("status")).isEqualTo(400);
        assertThat(body.get("error")).isEqualTo("Validation Error");
        assertThat(body.get("message")).isEqualTo("Invalid input data");

        Map<?, ?> errors = (Map<?, ?>) body.get("errors");
        assertThat(errors.get("name")).isEqualTo("Name is required");
    }

    @Test
    void handleAccessDenied_returns403() {
        ResponseEntity<Object> response =
                handler.handleAccessDenied(
                        new AccessDeniedException("Access denied")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        Map<?, ?> body = (Map<?, ?>) response.getBody();

        assertThat(body.get("status")).isEqualTo(403);
        assertThat(body.get("message")).isEqualTo("Access denied");
    }

    @Test
    void handleLockableEntityException_returns409() {
        ResponseEntity<Object> response =
                handler.handleAccessDenied(
                        new LockableEntityException("Locked")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void handleDeactivatedEntityException_returns409() {
        ResponseEntity<Object> response =
                handler.handleIllegalActionDueToState(
                        new DeactivatedEntityException("Deactivated")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void handleRemovedEntityException_returns409() {
        ResponseEntity<Object> response =
                handler.handleIllegalActionDueToState(
                        new RemovedEntityException("Removed")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void handleNotFound_returns404() {
        ResponseEntity<Object> response =
                handler.handleNotFound(
                        new EntityNotFoundException("Not found")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("message")).isEqualTo("Not found");
    }

    @Test
    void handlePermissionServiceException_returns500() {
        ResponseEntity<Object> response =
                handler.handleReBACException(
                        new PermissionServiceException("Keto down")
                );

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void handleIdentityServiceException_returns500() {
        ResponseEntity<Object> response =
                handler.handleReBACException(
                        new IdentityServiceException("Kratos down")
                );

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void handleObjectStorageException_returns500() {
        ResponseEntity<Object> response =
                handler.handleObjectStorageException(
                        new ObjectStorageException("Minio down")
                );

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void handleLabelConflict_returns409() {
        ResponseEntity<Object> response =
                handler.handleLabelConflict(
                        new LabelConflictException("Duplicate label")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        Map<?, ?> body = (Map<?, ?>) response.getBody();

        assertThat(body.get("field")).isEqualTo("label");
    }

    @Test
    void handleAccountRecoveryException_returns400() {
        ResponseEntity<Object> response =
                handler.handleAccountRecoveryException(
                        new AccountRecoveryException("Recovery failed")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void handleDataIntegrityViolation_returns409() {
        ResponseEntity<Object> response =
                handler.handleDataIntegrityViolation(
                        new DataIntegrityViolationException("Constraint violation")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void handleHttpMessageNotReadable_returns400() {
        HttpInputMessage inputMessage = Mockito.mock(HttpInputMessage.class);

        ResponseEntity<Object> response =
                handler.handleHttpMessageNotReadable(
                        new HttpMessageNotReadableException("Malformed", inputMessage)
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .isEqualTo("Malformed JSON or invalid request body");
    }

    @Test
    void handleMissingParameter_returns400() {
        ResponseEntity<Object> response =
                handler.handleMissingParam(
                        new MissingServletRequestParameterException("id", "Long")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void handleMissingHeader_returns400() {
        ResponseEntity<Object> response =
                handler.handleMissingHeader(
                        new MissingRequestHeaderException("X-User", null)
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void handleMethodNotSupported_returns405() {
        ResponseEntity<Object> response =
                handler.handleMethodNotSupported(
                        new HttpRequestMethodNotSupportedException("PATCH")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
    }

    @Test
    void handleMediaTypeNotSupported_returns415() {
        ResponseEntity<Object> response =
                handler.handleMediaTypeNotSupported(
                        new HttpMediaTypeNotSupportedException("unsupported")
                );

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    @Test
    void handleConstraintViolation_returns400() {
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        Path path = mock(Path.class);

        when(path.toString()).thenReturn("name");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("must not be blank");

        ConstraintViolationException ex =
                new ConstraintViolationException(Set.of(violation));

        ResponseEntity<Object> response =
                handler.handleConstraintViolation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        List<String> body = (List<String>) response.getBody();
        assertThat(body).contains("name: must not be blank");
    }

    @Test
    void handleMultipartException_returns400() {
        ResponseEntity<Object> response =
                handler.handleMultipartException(
                        new MultipartException("Invalid multipart")
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void handleMaxUploadSizeExceeded_returns413() {
        ResponseEntity<Object> response =
                handler.handleMaxUploadSizeExceeded(
                        new MaxUploadSizeExceededException(1024)
                );

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.CONTENT_TOO_LARGE);
    }

    @Test
    void handleGeneralException_returns500() {
        ResponseEntity<Object> response =
                handler.handleGeneralException(
                        new RuntimeException("Boom")
                );

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);

        Map<?, ?> body = (Map<?, ?>) response.getBody();

        assertThat(body.get("message"))
                .isEqualTo("An unexpected error occurred");
    }

    private static class DummyController {
        public void dummy(String value) {
        }
    }
}