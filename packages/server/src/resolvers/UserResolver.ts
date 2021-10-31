import { Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../context";
import { getLogger } from "../logger";

// @Resolver(() => User)
@Resolver()
// export class UserResolver implements ResolverInterface<User> {
export class UserResolver {
    @Query(() => String, { nullable: true })
    me(@Ctx() ctx: Context): string | undefined {
        getLogger().info("Context: ", ctx);
        return <string | undefined>ctx.user;
    }

    @Mutation(() => String)
    test(): string {
        return "Hello, World!";
    }
}