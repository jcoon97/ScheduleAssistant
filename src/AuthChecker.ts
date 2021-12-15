import { AuthCheckerInterface, ResolverData } from "type-graphql";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context } from "./context";
import { RoleType, User } from "./entities/User";
import { UserRepository } from "./repositories/UserRepository";

@Service()
export class AuthChecker implements AuthCheckerInterface<Context, RoleType> {
    @InjectRepository(User)
    private readonly userRepository!: UserRepository;

    async check({ context }: ResolverData<Context>, roles: RoleType[]): Promise<boolean> {
        // Immediately return if no `userId` exists in GQL context
        if (!context.userId) return false;
        const user: User | undefined = await this.userRepository.findOne({ id: context.userId });

        // Check if the user is authenticated when no roles and if the user
        // is authorized when roles are present
        if (roles.length === 0) return user !== undefined;
        if (!user) return false;

        // If roles are present, get the highest value of all specified, then check against user
        const roleLevels: number[] = roles.map((role: RoleType) => role.level);
        const maxLevel: number = Math.max(...roleLevels);
        return user.roleType.level >= maxLevel;
    }
}