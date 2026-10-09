export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

export const USER_ROLES = {
    USER: 'User',
    ORGANIZER: 'Organizer',
    ADMIN: 'Admin'
};

export const EVENT_STATUS = {
    PUBLISHED: 'published',
    DRAFT: 'draft',
    CANCELLED: 'cancelled'
};

export const BOOKING_STATUS = {
    ACTIVE: 'active',
    CANCELLED: 'cancelled'
};

export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[\s\S]{8,}$/, // At least 8 chars, 1 letter, 1 number
    OBJECT_ID: /^[0-9a-fA-F]{24}$/,
};