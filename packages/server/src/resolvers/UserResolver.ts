import { Authorized, Ctx, FieldResolver, Query, Resolver, ResolverInterface, Root } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context } from "../context";
import { Program } from "../entities/Program";
import { RoleType, User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

@Resolver(() => User)
export class UserResolver implements ResolverInterface<User> {
    @InjectRepository(User)
    private readonly userRepository!: UserRepository;

    @Authorized([ RoleType.DEFAULT, RoleType.ADMIN ])
    @Query(() => User, { nullable: true })
    async me(@Ctx() ctx: Context): Promise<User | undefined> {
        return await this.userRepository.findOne({ id: ctx.userId });
    }

    @FieldResolver()
    async program(@Root() user: User): Promise<Program | undefined> {
        return user.program;
    }
}