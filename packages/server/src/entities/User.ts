import { Field, ObjectType, registerEnumType } from "type-graphql";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity, Lazy } from "./BaseEntity";
import { Program } from "./Program";

export enum RoleType {
    DEFAULT = "DEFAULT",
    ADMIN = "ADMIN"
}

@Entity("users")
@ObjectType({ implements: BaseEntity })
export class User extends BaseEntity {
    @Column({ name: "first_name", nullable: true })
    @Field(() => String, {
        description: "The user's first (given) name, if specified.",
        nullable: true
    })
    firstName?: string;

    @Column({ name: "last_name", nullable: true })
    @Field(() => String, {
        description: "The user's last (family) name, if specified.",
        nullable: true
    })
    lastName?: string;

    @Column({ name: "email_address" })
    @Field(() => String, { description: "The user's email address, fetched from Google." })
    emailAddress!: string;

    @Column({ name: "google_id" })
    @Field(() => String, { description: "The user's Google ID" })
    googleId!: string;

    @Column({ type: "enum", enum: RoleType, default: RoleType.DEFAULT, name: "role_type" })
    @Field(() => RoleType, { description: "The user's current authorization level." })
    roleType!: RoleType;

    @Field(() => Program, {
        description: "The program the user is assigned to, if any.",
        nullable: true
    })
    @ManyToOne(() => Program, program => program.users, {
        lazy: true,
        nullable: true,
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "program_id" })
    program?: Lazy<Program>;
}

registerEnumType(RoleType, {
    description: "Possible authorization roles that can be assigned to a user.",
    name: "RoleType"
});