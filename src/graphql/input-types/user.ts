import { Field, InputType, Int } from "type-graphql";
import { RoleType, User } from "../../entities/User";

@InputType("CreateUserInput", { description: "Specifies the fields for creating a new user." })
export class CreateUserInput implements Partial<User> {
    @Field(() => String, { description: "The user's first name.", nullable: true })
    firstName?: string;

    @Field(() => String, { description: "The user's last name.", nullable: true })
    lastName?: string;

    @Field(() => String, { description: "The user's email address." })
    emailAddress!: string;

    @Field(() => Int, {
        defaultValue: RoleType.LEARNING_ASSISTANT.level,
        description: "The user's role level. Defaults to \"Learning Assistant\".",
        nullable: true
    })
    roleLevel!: number;
}