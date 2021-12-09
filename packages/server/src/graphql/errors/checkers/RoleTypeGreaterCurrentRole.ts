import { User } from "../../../entities/User";
import { ErrorChecker } from "../UserErrorBuilder";

export class RoleTypeGreaterCurrentRole implements ErrorChecker {
    async check(args: any[]): Promise<string | null> {
        if (args.length !== 2) {
            throw new Error("RoleTypeGreaterCurrentRole failed: Current user and/or role level were not specified");
        }

        const [ currentUser, roleLevel ]: [ User, number ] = args as any;
        return (roleLevel > currentUser.roleType.level)
            ? "Role level cannot be greater than your current role level."
            : null;
    }
}