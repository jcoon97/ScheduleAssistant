import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
@ObjectType()
export default class User {
    @Field(() => ID)
    @PrimaryGeneratedColumn({ name: "id" })
    readonly id!: number;

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