import { RoleTypable, RoleType, User } from "../../../entities/User";
import { BaseCheckerArgs, BaseErrorChecker } from "../UserErrorBuilder";

interface RoleTypeCompareArgs<T extends RoleTypable> extends BaseCheckerArgs {
    greaterSide: T;
    lesserSide: T;
}

interface RoleTypeExceedsCurrentUserArgs extends BaseCheckerArgs {
    currentUser: User;
    roleLevel: number;
}

interface RoleTypeNotFoundArgs extends BaseCheckerArgs {
    roleLevel: number;
}

class RoleTypeCompare<T extends RoleTypable> extends BaseErrorChecker<RoleTypeCompareArgs<T>> {
    async check(args: RoleTypeCompareArgs<T>): Promise<string | null> {
        if (args.nullable && (!args.greaterSide || !args.lesserSide)) return null;

        if (!args.nullable && (!args.greaterSide || !args.lesserSide)) {
            throw new Error("Greater side and lesser side cannot be undefined or null, unless nullable is set to true");
        }

        if (args.greaterSide.roleType.level > args.lesserSide.roleType.level) {
            return args.message ?? "Left role type cannot be greater than right role type.";
        }
        return null;
    }

}

export class RoleTypeCompareUser extends RoleTypeCompare<User> {

}

export class RoleTypeExceedsCurrentUser extends BaseErrorChecker<RoleTypeExceedsCurrentUserArgs> {
    async check(args: RoleTypeExceedsCurrentUserArgs): Promise<string | null> {
        if (args.nullable && (!args.currentUser || !args.roleLevel)) return null;

        if (!args.nullable && (!args.currentUser || !args.roleLevel)) {
            throw new Error("Current user and role level cannot be undefined or null, unless nullable is set to true");
        }

        if (args.roleLevel > args.currentUser.roleType.level) {
            return args.message ?? "Role level cannot be greater than your current role.";
        }
        return null;
    }
}

export class RoleTypeNotFound extends BaseErrorChecker<RoleTypeNotFoundArgs> {
    async check(args: RoleTypeNotFoundArgs): Promise<string | null> {
        if (args.nullable && !args.roleLevel) return null;
        if (!args.nullable && !args.roleLevel) throw new Error("Role level cannot be undefined or null, unless nullable is set to true");

        const roleType: RoleType | undefined = RoleType.valueByLevel(args.roleLevel);

        if (!roleType) {
            return args.message ?? `Role type could not be found by level ${ args.roleLevel }`;
        }
        return null;
    }
}