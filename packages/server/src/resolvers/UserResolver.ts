import { Authorized, Ctx, Query, Resolver } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context } from "../context";
import User, { RoleType } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

@Resolver(() => User)
export class UserResolver {
    constructor(@InjectRepository(User) private readonly userRepository: UserRepository) {

    }

    @Authorized(RoleType.DEFAULT)
    @Query(() => User, { nullable: true })
    async me(@Ctx() ctx: Context): Promise<User | undefined> {
        return await this.userRepository.findOne({ id: ctx.userId });
    }
}