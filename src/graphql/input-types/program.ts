import { Field, InputType } from "type-graphql";
import { Program } from "../../entities/Program";

@InputType("CreateProgramInput", { description: "Specifies the fields for creating a new program." })
export class CreateProgramInput implements Partial<Program> {
    @Field(() => String, { description: "Specifies an abbreviation for the program, e.g. FSF." })
    abbreviation!: string;

    @Field(() => String, { description: "Specifies the name of the program, e.g. Full Stack Flex" })
    name!: string;
}