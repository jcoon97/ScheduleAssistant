import { ArgsType, Field, ID } from "type-graphql";
import { Program } from "../entities/Program";
import { IsEntityFound } from "../validators/entity";

@ArgsType()
export class GetProgramByIdArgs {
    @Field(() => ID)
    @IsEntityFound(Program, undefined, {
        message: "Program could not be found by specified ID"
    })
    id!: number;
}