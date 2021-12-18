import { ArgsType, Field, ID } from "type-graphql";

@ArgsType()
export class AssignUserProgramArgs {
    @Field(() => ID, { description: "Specifies the program that the user will be assigned to." })
    programId!: string;

    @Field(() => ID, { description: "Specifies the user that will be assigned." })
    userId!: string;
}

@ArgsType()
export class ProgramByIdArgs {
    @Field(() => ID, { description: "Specifies the ID of the program to return." })
    id!: string;
}