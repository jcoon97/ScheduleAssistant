import { getRepository, Repository } from "typeorm";
import { User } from "../../../entities/User";
import { BaseCheckerArgs, BaseErrorChecker } from "../UserErrorBuilder";

interface UserAlreadyExistsArgs extends BaseCheckerArgs {
    property: keyof User;
    value: string;
}

export class UserAlreadyExists extends BaseErrorChecker<UserAlreadyExistsArgs> {
    async check(args: UserAlreadyExistsArgs): Promise<string | null> {
        const repository: Repository<User> = getRepository(User);
        const foundUser: User | undefined = await repository.findOne({ [args.property]: args.value });

        if (foundUser) {
            return args.message ?? "User already exists in the database.";
        }
        return null;
    }
}