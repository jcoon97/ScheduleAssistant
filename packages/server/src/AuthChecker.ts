import { AuthCheckerInterface, ResolverData } from "type-graphql";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context } from "./context";
import User from "./entities/User";
import { getLogger } from "./logger";

@Service()
export class AuthChecker implements AuthCheckerInterface<Context> {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {

    }

    async check({ context }: ResolverData<Context>, _roles: string[]): Promise<boolean> {
        if (!context.userId) {
            getLogger().debug("context.userId was returned as undefined");
            return false;
        }

        const user: User | undefined = await this.userRepository.findOne({ id: context.userId });
        getLogger().debug("User was found when checking auth? ", user !== undefined);
        return user !== undefined;
    }
}