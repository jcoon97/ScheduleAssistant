import { Field, ID, InputType } from "type-graphql";
import { Program } from "../entities/Program";
import { User } from "../entities/User";
import { IsEntityFound } from "../validators/entity";
import { AssignUserProgramInput } from "./AssignUserProgramInput";

type IChangeProgramLeadOrManagerInput = Required<Pick<AssignUserProgramInput, "programId" | "userId">>;

@InputType("ChangeProgramLeadOrManagerInput")
export class ChangeProgramLeadOrManagerInput implements IChangeProgramLeadOrManagerInput {
    @Field(() => ID)
    @IsEntityFound(Program, "id", {
        message: "Program could not be found by specified ID"
    })
    programId!: number;

    @Field(() => ID)
    @IsEntityFound(User, "id", {
        message: "User could not be found by specified ID"
    })
    userId!: number;
}