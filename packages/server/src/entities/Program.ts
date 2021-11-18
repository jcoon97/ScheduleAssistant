import { Field, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { BaseEntity, Lazy } from "./BaseEntity";
import { User } from "./User";

@Entity("programs")
@ObjectType({ implements: BaseEntity })
export class Program extends BaseEntity {
    @Column({ name: "name" })
    @Field(() => String, { description: "The program's name, e.g. Full Stack Flex." })
    name!: string;

    @Column({ name: "abbreviation" })
    @Field(() => String, { description: "The program's abbreviation, e.g. FSF." })
    abbreviation!: string;

    @Field(() => User, {
        description: "The program's lead or manager, if one has been assigned.",
        nullable: true
    })
    @OneToOne(() => User, { lazy: true })
    @JoinColumn({ name: "lead_manager_id" })
    leadOrManager?: Lazy<User>;

    @Field(() => [ User ], {
        description: "Array of users that have been assigned to the program.",
        nullable: true
    })
    @OneToMany(() => User, user => user.program, { lazy: true, onDelete: "CASCADE" })
    users!: Lazy<User[]>;
}