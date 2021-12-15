import { ArgsType, Field, ID, Int } from "type-graphql";

@ArgsType()
export class ElevateUserRoleArgs {
    @Field(() => Int, { description: "Specifies the level to set the user to." })
    level!: number;

    @Field(() => ID, { description: "Specifies the user whose permission will get elevated." })
    userId!: string;
}