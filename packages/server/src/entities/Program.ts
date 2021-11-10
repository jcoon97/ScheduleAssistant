import { Field, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
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

    @Field(() => User, { nullable: true })
    @OneToOne(() => User, { lazy: true })
    @JoinColumn({ name: "lead_manager_id" })
    leadOrManager?: Lazy<User>;

    @Field(() => [ User ], { nullable: true })
    @OneToMany(() => User, user => user.program, { lazy: true })
    users!: Lazy<User[]>;
}