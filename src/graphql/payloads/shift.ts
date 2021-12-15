import { Field, ObjectType } from "type-graphql";
import { Shift } from "../../entities/Shift";
import withUserErrors from "../with-user-errors";

@ObjectType({ isAbstract: true })
class BaseShiftPayload extends withUserErrors() {
    @Field(() => Shift, {
        description: "The shift returned from the mutation.",
        nullable: true
    })
    shift?: Shift;
}

@ObjectType({ description: "Return type for `shiftCreate` mutation." })
export class CreateShiftPayload extends BaseShiftPayload {

}