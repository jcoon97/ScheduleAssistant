export enum ErrorCode {
    PROGRAM_USER_ALREADY_ASSIGNED = "PROGRAM_USER_ALREADY_ASSIGNED",
    PROGRAM_USER_ALREADY_LEAD_MANAGER = "PROGRAM_USER_ALREADY_LEAD_MANAGER",

    USER_CANNOT_ELEVATE_HIGHER_ROLE = "USER_CANNOT_ELEVATE_HIGHER_ROLE",
    USER_ROLE_DOES_NOT_EXIST = "USER_ROLE_DOES_NOT_EXIST",
    USER_ROLE_GREATER_EQUAL_THAN_SELF = "USER_ROLE_GREATER_EQUAL_THAN_SELF"
}

export class APIError extends Error {
    constructor(public code: ErrorCode, message: string) {
        super(message);
        Object.setPrototypeOf(this, APIError.prototype);
    }
}