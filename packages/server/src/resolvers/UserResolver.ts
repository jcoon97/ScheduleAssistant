import { Authorized, Ctx, Query, Resolver } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context } from "../context";
import { RoleType, User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

@Resolver(() => User)
export class UserResolver {
    @InjectRepository(User)
    private readonly userRepository!: UserRepository;

    @Authorized(RoleType.LEARNING_ASSISTANT)
    @Query(() => User, {
        description: "Returns a User entity for who is currently authenticated via JWT token.",
        nullable: true
    })
    async me(@Ctx() ctx: Context): Promise<User | undefined> {
        return await this.userRepository.findOne({ id: ctx.userId });
    }

    @Authorized(RoleType.LA_MANAGER)
    @Query(() => [ RoleType ], {
        name: "userRoleTypes",
        description: "Returns an array of user role types that can be used."
    })
    async roleTypes(): Promise<RoleType[]> {
        return RoleType.values().concat();
    }
}