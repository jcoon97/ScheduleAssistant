import { Field, ID, InputType } from "type-graphql";
import { Shift, Workdays } from "../../entities/Shift";

@InputType("CreateShiftInput", {
    description: "Specifies the fields for creating a new shift."
})
export class CreateShiftInput implements Partial<Shift> {
    @Field(() => ID, {
        description: "Specifies the user that will work this shift, if any.",
        nullable: true
    })
    userId?: string;

    @Field(() => ID, {
        description: "Specifies the program that this shift will be attached to."
    })
    programId!: string;

    @Field(() => [ Workdays ], {
        description: "Specifies the array of workdays that this shift will be active."
    })
    workdays!: Workdays[];
}