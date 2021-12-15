import { Field, ObjectType } from "type-graphql";

@ObjectType({ description: "Represents an error in the input of a mutation." })
export class UserError {
    @Field(() => [ String ], {
        description: "The path to the input field that caused the error.",
        nullable: true
    })
    field?: string[];

    @Field(() => String, { description: "The error message." })
    message!: string;
}