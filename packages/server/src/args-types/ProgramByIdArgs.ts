import { ArgsType, Field, ID } from "type-graphql";
import { Program } from "../entities/Program";
import { IsEntityFound } from "../validators/entity";

@ArgsType()
export class ProgramByIdArgs {
    @Field(() => ID, { description: "Specifies the ID of the program to return." })
    @IsEntityFound(Program)
    id!: string;
}