import { Field, ID, InputType } from "type-graphql";
import { Program } from "../entities/Program";
import { User } from "../entities/User";
import { IsEntityFound } from "../validators/entity";

@InputType("ChangeProgramLeadOrManagerInput")
export class ChangeProgramLeadOrManagerInput {
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