import { Enum, EnumType } from "ts-jenum";
import { Field, Int, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity, Lazy } from "./BaseEntity";
import { Program } from "./Program";
import { Shift } from "./Shift";

@Enum<RoleType>("name")
@ObjectType()
export class RoleType extends EnumType<RoleType>() {
    static readonly LEARNING_ASSISTANT = new RoleType(1, "Learning Assistant");
    static readonly SENIOR_LA = new RoleType(2, "Senior LA");
    static readonly LEAD_LA = new RoleType(3, "Lead LA");
    static readonly LA_MANAGER = new RoleType(4, "LA Manager");
    static readonly ADMINISTRATOR = new RoleType(5, "Administrator");

    @Field(() => Int, { description: "The role's permission level, expressed as an integer." })
    readonly level: number;

    @Field(() => String, { description: "The role's name, e.g. Learning Assistant." })
    readonly name: string;

    private constructor(level: number, name: string) {
        super();
        this.level = level;
        this.name = name;
    }

    static levels = (): number[] => RoleType.values().map((value: RoleType) => value.level);

    static valueByLevel = (level: number): RoleType | undefined => RoleType.values()
        .find((value: RoleType) => value.level === level);
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

    @Column({ name: "google_id", nullable: true })
    @Field(() => String, { description: "The user's Google ID", nullable: true })
    googleId?: string;

    @Column({
        type: "enum",
        default: RoleType.LEARNING_ASSISTANT.level,
        enum: RoleType.levels(),
        name: "role_type",
        transformer: {
            from: (value: number): RoleType | undefined => RoleType.valueByLevel(value),
            to: (value: RoleType): number => value.level
        }
    })
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

    @OneToMany(() => Shift, shift => shift.user, {
        cascade: [ "soft-remove" ],
        lazy: true
    })
    shifts?: Lazy<Shift[]>;
}