import { Field, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity, Lazy } from "./BaseEntity";
import { User } from "./User";

@Entity("programs")
@ObjectType({ implements: BaseEntity })
export class Program extends BaseEntity {
    @Column({ name: "name" })
    @Field(() => String)
    name!: string;

    @Column({ name: "abbreviation" })
    @Field(() => String)
    abbreviation!: string;

    @Field(() => [ User ], { nullable: true })
    @OneToMany(() => User, user => user.program, { lazy: true })
    users!: Lazy<User[]>;
}