import { getRepository, Repository } from "typeorm";
import { User } from "../../../entities/User";
import { ErrorChecker } from "../UserErrorBuilder";

export class UserAlreadyExists implements ErrorChecker {
    async check(args: any[]): Promise<string | null> {
        if (args.length !== 2) {
            throw new Error("UserAlreadyExists failed: User property and/or value was not specified");
        }

        const repository: Repository<User> = getRepository(User);
        const [ property, value ]: [ keyof User, string ] = args as any;
        const foundUser: User | undefined = await repository.findOne({ [property]: value });
        return foundUser ? "User already exists in the database." : null;
    }
}