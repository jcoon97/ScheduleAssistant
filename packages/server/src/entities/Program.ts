import { Field, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity, Lazy } from "./BaseEntity";
import { Shift } from "./Shift";
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

    @OneToMany(() => Shift, shift => shift.program, {
        cascade: [ "soft-remove" ],
        lazy: true
    })
    shifts!: Lazy<Shift[]>;

    @Field(() => [ User ], {
        description: "Array of users that have been assigned to the program.",
        nullable: true
    })
    @OneToMany(() => User, user => user.program, {
        cascade: [ "soft-remove" ],
        lazy: true
    })
    users!: Lazy<User[]>;
}