import { Field, ObjectType } from "type-graphql";
import { UserError } from "./errors/UserError";

export default function withUserErrors(): any {
    @ObjectType({ isAbstract: true })
    abstract class UserErrorsTrait {
        @Field(() => [ UserError ], {
            description: "The list of errors that occurred from executing the mutation."
        })
        userErrors!: UserError[];
    }

    return UserErrorsTrait;
}