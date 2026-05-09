import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { DatabaseTableEnum } from "@libs/enums/database";
import { Column, Entity, ManyToMany } from "typeorm";
import { PermissionEnum } from "@libs/enums";
import { Exclude } from "class-transformer";
import { UserEntity } from "./user.entity";
import { RoleEntity } from "./role.entity";

@Entity(DatabaseTableEnum.PERMISSION)
export class PermissionEntity extends BasicEntityProperties {
    @Column({ type: `varchar`, unique: true, length: 64, nullable: false })
    public value: PermissionEnum;

    @Column({ type: `enum`, enum: PermissionEnum, nullable: true, default: null })
    @Exclude()
    public assignedEnum?: PermissionEnum;

    @ManyToMany(() => UserEntity, (user) => user.permissions, {
        nullable: true,
        onDelete: `CASCADE`,
    })
    public users?: UserEntity[];

    @ManyToMany(() => RoleEntity, (role) => role.permissions, {
        nullable: true,
        onDelete: `CASCADE`,
    })
    public roles?: RoleEntity[];
}
