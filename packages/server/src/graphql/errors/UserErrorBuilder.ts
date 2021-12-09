import { Constructable } from "typedi";
import { UserError } from "./UserError";

export interface ErrorChecker {
    check(args: any[]): Promise<string | null>;
}

interface ErrorCheckerData {
    field: string[];
    instance: ErrorChecker;
    args: any[];
}

export class UserErrorBuilder {
    private readonly checkers: ErrorCheckerData[];

    constructor() {
        this.checkers = [];
    }

    async build(): Promise<UserError[]> {
        const userErrors: UserError[] = [];

        for (const { field, instance, args } of this.checkers) {
            const result: string | null = await instance.check(args);
            if (result) userErrors.push({ field, message: result });
        }
        return userErrors;
    }

    check<T extends ErrorChecker>(field: string[], checkerClass: Constructable<T>, ...args: any[]): UserErrorBuilder {
        this.checkers.push({ field, instance: new checkerClass(), args });
        return this;
    }
}