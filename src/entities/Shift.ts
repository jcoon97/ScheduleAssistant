import { Field, ObjectType, registerEnumType } from "type-graphql";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Program } from "./Program";
import { User } from "./User";

export enum Workdays {
    SUNDAY,
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY
}

@Entity("shifts")
@ObjectType({ implements: BaseEntity })
export class Shift extends BaseEntity {
    @Field(() => User, {
        description: "The user that has been assigned to this shift, if any.",
        nullable: true
    })
    @ManyToOne(() => User, user => user.shifts, {
        lazy: true,
        nullable: true,
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "user_id" })
    user?: User;

    @Field(() => Program, {
        description: "The program that has been assigned to this shift."
    })
    @ManyToOne(() => Program, program => program.shifts, {
        lazy: true,
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "program_id" })
    program!: Program;

    @Column("enum", {
        array: true,
        default: [],
        enum: Workdays
    })
    @Field(() => [ Workdays ], {
        description: "Array of workdays assigned to this shift."
    })
    workdays!: Workdays[];
}

registerEnumType(Workdays, {
    name: "Workdays",
    description: "Possible workdays that can be assigned to a shift."
});