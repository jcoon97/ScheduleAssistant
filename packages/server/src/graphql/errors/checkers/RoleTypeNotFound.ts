import { RoleType } from "../../../entities/User";
import { BaseCheckerArgs, BaseErrorChecker } from "../UserErrorBuilder";

interface RoleTypeNotFoundArgs extends BaseCheckerArgs {
    roleLevel: number;
}

export class RoleTypeNotFound extends BaseErrorChecker<RoleTypeNotFoundArgs> {
    async check(args: RoleTypeNotFoundArgs): Promise<string | null> {
        const roleType: RoleType | undefined = RoleType.valueByLevel(args.roleLevel);

        if (!roleType) {
            return args.message ?? "Role type could not be found by level.";
        }
        return null;
    }
}