import { AuthCheckerInterface, ResolverData } from "type-graphql";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context } from "./context";
import { RoleType, User } from "./entities/User";
import { UserRepository } from "./repositories/UserRepository";

@Service()
export class AuthChecker implements AuthCheckerInterface<Context> {
    @InjectRepository(User)
    private readonly userRepository!: UserRepository;

    async check({ context }: ResolverData<Context>, roles: string[]): Promise<boolean> {
        // Immediately return if no `userId` exists in GQL context
        if (!context.userId) return false;
        const user: User | undefined = await this.userRepository.findOne({ id: context.userId });

        // Check if the user is authenticated when no roles and if the user
        // is authorized when roles are present
        if (roles.length === 0) return user !== undefined;
        if (!user) return false;

        // Finally, check if user is authorized when roles are present
        for (const role of roles) {
            if (user.roleType === <keyof typeof RoleType>role) {
                return true;
            }
        }
        return false;
    }
}