import { User } from "../../../entities/User";
import { ErrorChecker } from "../UserErrorBuilder";

export class RoleTypeGreaterSpecifiedRole implements ErrorChecker {
    async check(args: any[]): Promise<string | null> {
        if (args.length !== 2) {
            throw new Error("RoleTypeGreaterSpecifiedRole failed: Two users must be supplied to check against");
        }

        const [ leftSide, rightSide ]: [ User, User ] = args as any;
        return leftSide.roleType.level > rightSide.roleType.level
            ? "Left role type cannot be greater than right role type."
            : null;
    }
}