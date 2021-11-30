import { IsUUID } from "class-validator";
import { ArgsType, Field, ID, Int } from "type-graphql";
import { User } from "../entities/User";
import { IsEntityFound } from "../validators/entity";

@ArgsType()
export class ElevateUserRoleArgs {
    @Field(() => Int, { description: "Specifies the level to set the user to." })
    level!: number;

    @Field(() => ID, { description: "Specifies the user whose permission will get elevated." })
    @IsUUID(4)
    @IsEntityFound(User, "id")
    userId!: string;
}