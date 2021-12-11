import { Constructable } from "typedi";
import { UserError } from "./UserError";

export interface BaseCheckerArgs {
    message?: string;
}

interface IntlCheckerData {
    field: string[];
    instance: BaseErrorChecker<any>;
    args: any;
}

type CheckerArgs<T extends { check: (args: T) => Promise<string | null> }> = Parameters<T["check"]>[0];

export abstract class BaseErrorChecker<T extends BaseCheckerArgs> {
    abstract check(args: T): Promise<string | null>;
}

export class UserErrorBuilder {
    private readonly checkers: IntlCheckerData[];

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

    check<T extends BaseErrorChecker<any>>(
        field: string[],
        constructable: Constructable<T>,
        args: CheckerArgs<T>
    ): UserErrorBuilder {
        this.checkers.push({ field, instance: new constructable(), args });
        return this;
    }
}