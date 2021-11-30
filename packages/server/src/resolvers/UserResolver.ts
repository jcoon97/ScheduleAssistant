import { Args, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { ElevateUserRoleArgs } from "../args-types/ElevateUserRoleArgs";
import { Context } from "../context";
import { RoleType, User } from "../entities/User";
import { APIError, ErrorCode } from "../errors/APIError";
import { UserRepository } from "../repositories/UserRepository";

@Resolver(() => User)
export class UserResolver {
    @InjectRepository(User)
    private readonly userRepository!: UserRepository;

    @Authorized(RoleType.LEAD_LA)
    @Mutation(() => User, {
        name: "userElevateRole",
        description: "Elevates a user's role type to the specified level."
    })
    async elevateUserRole(@Args() args: ElevateUserRoleArgs, @Ctx() ctx: Context): Promise<User> {
        const currentUser: User = (await this.userRepository.findOne({ id: ctx.userId }))!;
        const elevateUser: User = (await this.userRepository.findOne({ id: args.userId }))!;

        // Confirm that the user to elevate is not of a higher permission level than the current user
        if (elevateUser.roleType.level > currentUser.roleType.level) {
            throw new APIError(
                ErrorCode.USER_CANNOT_ELEVATE_HIGHER_ROLE,
                "Cannot elevate permission for user that is of a higher role type"
            );
        }

        // Confirm that the user role exists by ID
        const roleType: RoleType | undefined = RoleType.valueByLevel(args.level);

        if (!roleType) {
            throw new APIError(
                ErrorCode.USER_ROLE_DOES_NOT_EXIST,
                `User role could not be found by level ${ args.level }`
            );
        }

        // Confirm that specified role is not equal or greater than current user's role
        // (e.g., a Lead LA cannot make another user a Lead LA; a LA Manager or higher can.)
        if (roleType.level >= currentUser.roleType.level) {
            throw new APIError(
                ErrorCode.USER_ROLE_GREATER_EQUAL_THAN_SELF,
                "Cannot elevate to role type that is greater than or equal to current user role"
            );
        }

        elevateUser.roleType = roleType;
        return this.userRepository.save(elevateUser);
    }

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