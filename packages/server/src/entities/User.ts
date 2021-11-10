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

    @Column({ type: "enum", enum: RoleType, default: RoleType.DEFAULT, name: "role_type" })
    @Field(() => RoleType)
    roleType!: RoleType;

    @Field(() => Program, { nullable: true })
    @ManyToOne(() => Program, program => program.users, { lazy: true, nullable: true })
    @JoinColumn({ name: "program_id" })
    program?: Lazy<Program>;
}

registerEnumType(RoleType, {
    name: "RoleType"
});