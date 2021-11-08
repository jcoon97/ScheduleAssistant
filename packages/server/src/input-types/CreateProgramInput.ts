import { Field, InputType } from "type-graphql";
import { Program } from "../entities/Program";
import { IsEntityNotFound } from "../validators/entity";

@InputType("CreateProgramInput")
export class CreateProgramInput implements Partial<Program> {
    @Field(() => String)
    @IsEntityNotFound(Program, undefined, {
        message: "Program was already found with specified abbreviation"
    })
    abbreviation!: string;

    @Field(() => String)
    @IsEntityNotFound(Program, undefined, {
        message: "Program was already found with specified name"
    })
    name!: string;
}