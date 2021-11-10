import { IsNumberString } from "class-validator";
import { ArgsType, Field, ID } from "type-graphql";
import { Program } from "../entities/Program";
import { User } from "../entities/User";
import { IsEntityFound } from "../validators/entity";

@ArgsType()
export class ChangeProgramLeadManagerArgs {
    @Field(() => ID, { description: "Specifies the program that the user will be made lead/manager of." })
    @IsEntityFound(Program, "id")
    @IsNumberString()
    programId!: string;

    @Field(() => ID, { description: "Specifies the user that will be made lead/manager." })
    @IsEntityFound(User, "id")
    @IsNumberString()
    userId!: string;
}