import { Field, ObjectType } from "type-graphql";
import { Program } from "../../entities/Program";
import withUserErrors from "../with-user-errors";

@ObjectType({ isAbstract: true })
class BaseProgramPayload extends withUserErrors() {
    @Field(() => Program, {
        description: "The program returned from the mutation.",
        nullable: true
    })
    program?: Program;
}

@ObjectType({ description: "Return type for `programAssignUser` mutation." })
export class AssignUserProgramPayload extends BaseProgramPayload {

}

@ObjectType({ description: "Return type for `programCreate` mutation." })
export class CreateProgramPayload extends BaseProgramPayload {

}