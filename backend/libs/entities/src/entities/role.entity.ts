import { DatabaseRelationTableEnum, DatabaseTableEnum } from "@libs/enums/database";
import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { PermissionEntity } from "./permission.entity";
import { Exclude } from "class-transformer";
import { UserEntity } from "./user.entity";
import { RoleEnum } from "@libs/enums";

@Entity(DatabaseTableEnum.ROLE)
export class RoleEntity extends BasicEntityProperties {
    @Column({ type: `varchar`, unique: true, length: 64, nullable: false })
    public name: RoleEnum;

    @Column({ type: `enum`, enum: RoleEnum, nullable: true, default: null })
    @Exclude()
    public assignedEnum?: RoleEnum;

    @ManyToMany(() => UserEntity, (user) => user.roles, { onDelete: `CASCADE` })
    public users: UserEntity[];

    @ManyToMany(() => PermissionEntity, (permission) => permission.roles, {
        onDelete: `CASCADE`,
    })
    @JoinTable({ name: DatabaseRelationTableEnum.PERMISSIONS_ON_ROLES })
    public permissions: PermissionEntity[];
}
