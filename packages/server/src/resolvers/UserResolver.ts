import { Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context } from "../context";
import User from "../entities/User";

@Resolver(() => User)
export class UserResolver {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {

    }

    @Authorized()
    @Query(() => User, { nullable: true })
    async me(@Ctx() ctx: Context): Promise<User | undefined> {
        return await this.userRepository.findOne({ id: ctx.userId });
    }
}