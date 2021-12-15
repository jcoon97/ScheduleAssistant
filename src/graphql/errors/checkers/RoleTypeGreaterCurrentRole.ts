import { User } from "../../../entities/User";
import { BaseCheckerArgs, BaseErrorChecker } from "../UserErrorBuilder";

interface RoleTypeGreaterCurrentRoleArgs extends BaseCheckerArgs {
    currentUser: User;
    roleLevel: number;
}

export class RoleTypeGreaterCurrentRole extends BaseErrorChecker<RoleTypeGreaterCurrentRoleArgs> {
    async check(args: RoleTypeGreaterCurrentRoleArgs): Promise<string | null> {
        if (args.roleLevel > args.currentUser.roleType.level) {
            return args.message ?? "Role level cannot be greater than your current role.";
        }
        return null;
    }
}