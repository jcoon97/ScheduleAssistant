import { Field, ObjectType } from "type-graphql";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("users")
@ObjectType()
export default class User extends BaseEntity {
    @Column({ name: "first_name", nullable: true })
    @Field(() => String, { nullable: true })
    firstName?: string;

    @Column({ name: "last_name", nullable: true })
    @Field(() => String, { nullable: true })
    lastName?: string;

    @Column({ name: "email_address" })
    @Field(() => String)
    emailAddress!: string;

    @Column({ name: "google_id" })
    @Field(() => String)
    googleId!: string;
}