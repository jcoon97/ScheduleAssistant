import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context } from "../../context";
import { RoleType, User } from "../../entities/User";
import { UserRepository } from "../../repositories/UserRepository";
import { ElevateUserRoleArgs } from "../args-types/ElevateUserRoleArgs";
import { UserDoesNotExist } from "../errors/checkers/entity-not-exists";
import { RoleTypeGreaterCurrentRole } from "../errors/checkers/RoleTypeGreaterCurrentRole";
import { RoleTypeGreaterSpecifiedRole } from "../errors/checkers/RoleTypeGreaterSpecifiedRole";
import { RoleTypeNotFound } from "../errors/checkers/RoleTypeNotFound";
import { UserAlreadyExists } from "../errors/checkers/UserAlreadyExists";
import { UserError } from "../errors/UserError";
import { UserErrorBuilder } from "../errors/UserErrorBuilder";
import { CreateUserInput } from "../input-types/CreateUserInput";
import { CreateUserPayload, ElevateUserRolePayload } from "../payloads/user";

@Resolver(() => User)
export class UserResolver {
    @InjectRepository(User)
    private readonly userRepository!: UserRepository;

    @Authorized(RoleType.LEAD_LA)
    @Mutation(() => CreateUserPayload, {
        description: "Creates a new user.",
        name: "userCreate"
    })
    async createUser(@Ctx() ctx: Context, @Arg("input") input: CreateUserInput): Promise<CreateUserPayload> {
        const { roleLevel, ...restInput } = input;
        const currentUser: User = (await this.userRepository.findOne({ id: ctx.userId }))!;
        const userErrors: UserError[] = await new UserErrorBuilder()
            .check([ "input", "emailAddress" ], UserAlreadyExists, { property: "emailAddress", value: input.emailAddress })
            .check([ "input", "roleLevel" ], RoleTypeNotFound, { roleLevel })
            .check([ "input", "roleLevel" ], RoleTypeGreaterCurrentRole, { currentUser, roleLevel })
            .build();

        if (userErrors.length === 0) {
            const roleType: RoleType = RoleType.valueByLevel(roleLevel)!;
            let user: User = this.userRepository.create({ roleType, ...restInput });
            user = await this.userRepository.save(user);
            return { user, userErrors };
        }
        return { user: undefined, userErrors };
    }

    @Authorized(RoleType.LEAD_LA)
    @Mutation(() => ElevateUserRolePayload, {
        name: "userElevateRole",
        description: "Elevates a user's role type to the specified role level."
    })
    async elevateUserRole(@Args() args: ElevateUserRoleArgs, @Ctx() ctx: Context): Promise<ElevateUserRolePayload> {
        const currentUser: User = (await this.userRepository.findOne({ id: ctx.userId }))!;
        let elevateUser: User = (await this.userRepository.findOne({ id: args.userId }))!;
        const roleType: RoleType = RoleType.valueByLevel(args.level)!;
        const userErrors: UserError[] = await new UserErrorBuilder()
            .check([ "userId" ], UserDoesNotExist, { property: "id", value: args.userId })
            .check([ "level" ], RoleTypeNotFound, { roleLevel: args.level })
            .check([ "userId" ], RoleTypeGreaterSpecifiedRole, { leftSide: elevateUser, rightSide: currentUser })
            .check([ "userId" ], RoleTypeGreaterCurrentRole, { currentUser, roleLevel: args.level })
            .build();

        if (userErrors.length === 0) {
            elevateUser.roleType = roleType;
            elevateUser = await this.userRepository.save(elevateUser);
            return { user: elevateUser, userErrors };
        }
        return { user: undefined, userErrors };
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