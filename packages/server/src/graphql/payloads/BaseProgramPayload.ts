import { Field, ObjectType } from "type-graphql";
import { Program } from "../../entities/Program";
import withUserErrors from "../with-user-errors";

@ObjectType({ isAbstract: true })
export class BaseProgramPayload extends withUserErrors() {
    @Field(() => Program, {
        description: "The program returned from the mutation.",
        nullable: true
    })
    program?: Program;
}