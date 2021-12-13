import { Constructable } from "typedi";
import { getLogger } from "../../logger";
import { UserError } from "./UserError";

export interface BaseCheckerArgs {
    message?: string;
    nullable?: boolean;
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
            let result: string | null = null;

            try {
                result = await instance.check(args);
            } catch (err) {
                getLogger().error("User Error Builder failed during a check... ", err);
            }
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