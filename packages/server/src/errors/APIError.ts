export enum ErrorCode {
    PROGRAM_USER_ALREADY_ASSIGNED = "PROGRAM_USER_ALREADY_ASSIGNED",
    PROGRAM_USER_ALREADY_LEAD_MANAGER = "PROGRAM_USER_ALREADY_LEAD_MANAGER"
}

export class APIError extends Error {
    constructor(public code: ErrorCode, message: string) {
        super(message);
        Object.setPrototypeOf(this, APIError.prototype);
    }
}