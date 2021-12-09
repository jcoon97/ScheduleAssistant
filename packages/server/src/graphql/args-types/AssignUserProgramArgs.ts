import { IsUUID } from "class-validator";
import { ArgsType, Field, ID } from "type-graphql";
import { Program } from "../../entities/Program";
import { User } from "../../entities/User";
import { IsEntityFound } from "../../validators/entity";

@ArgsType()
export class AssignUserProgramArgs {
    @Field(() => ID, { description: "Specifies the program that the user will be assigned to." })
    @IsUUID(4)
    @IsEntityFound(Program, "id")
    programId!: string;

    @Field(() => ID, { description: "Specifies the user that will be assigned." })
    @IsUUID(4)
    @IsEntityFound(User, "id")
    userId!: string;
}