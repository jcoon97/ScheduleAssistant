import { Field, ObjectType } from "type-graphql";
import { User } from "../../entities/User";
import withUserErrors from "../with-user-errors";

@ObjectType({ isAbstract: true })
export class BaseUserPayload extends withUserErrors() {
    @Field(() => User, {
        description: "The user returned from the mutation.",
        nullable: true
    })
    user?: User;
}