import { User } from "../../../entities/User";
import { BaseCheckerArgs, BaseErrorChecker } from "../UserErrorBuilder";

interface RoleTypeGreaterSpecifiedRoleArgs extends BaseCheckerArgs {
    leftSide: User;
    rightSide: User;
}

export class RoleTypeGreaterSpecifiedRole extends BaseErrorChecker<RoleTypeGreaterSpecifiedRoleArgs> {
    async check(args: RoleTypeGreaterSpecifiedRoleArgs): Promise<string | null> {
        if (args.leftSide.roleType.level > args.rightSide.roleType.level) {
            return args.message ?? "Left role type cannot be greater than right role type.";
        }
        return null;
    }

}