import { Field, ObjectType } from "type-graphql";
import { User } from "../../entities/User";
import withUserErrors from "../with-user-errors";

@ObjectType({ isAbstract: true })
class BaseUserPayload extends withUserErrors() {
    @Field(() => User, {
        description: "The user returned from the mutation.",
        nullable: true
    })
    user?: User;
}

@ObjectType({ description: "Return type for `userCreate` mutation." })
export class CreateUserPayload extends BaseUserPayload {

}

@ObjectType({ description: "Return type for `userElevateRole` mutation." })
export class ElevateUserRolePayload extends BaseUserPayload {

}