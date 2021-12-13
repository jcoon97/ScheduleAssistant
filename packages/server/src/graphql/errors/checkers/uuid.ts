import { BaseCheckerArgs, BaseErrorChecker } from "../UserErrorBuilder";

interface IsNotUUIDArgs extends BaseCheckerArgs {
    value?: string;
}

export class IsNotUUID extends BaseErrorChecker<IsNotUUIDArgs> {
    static UUID_PATTERN = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    async check(args: IsNotUUIDArgs): Promise<string | null> {
        if (args.nullable && !args.value) return null;
        if (!args.nullable && !args.value) throw new Error("Value cannot be undefined or null, nullable is not set to true");

        if (args.value && !IsNotUUID.UUID_PATTERN.test(args.value)) {
            return args.message ?? "Property must be valid UUID.";
        }
        return null;
    }
}