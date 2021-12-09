import { RoleType } from "../../../entities/User";
import { ErrorChecker } from "../UserErrorBuilder";

export class RoleTypeNotFound implements ErrorChecker {
    async check(args: any[]): Promise<string | null> {
        if (args.length !== 1) {
            throw new Error("RoleTypeNotFound failed: Role level was not specified");
        }

        const [ roleLevel ]: [ number ] = args as any;
        const roleType: RoleType | undefined = RoleType.valueByLevel(roleLevel);
        return !roleType ? "Role type could not be found by level." : null;
    }
}