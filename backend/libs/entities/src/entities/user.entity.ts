import { DatabaseRelationTableEnum, DatabaseTableEnum } from "@libs/enums/database";
import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { EncryptionTransformer as transformer } from "@libs/utils";
import { HttpRequestEntity } from "./http-request.entity";
import { RedirectionEntity } from "./redirection.entity";
import { PermissionEntity } from "./permission.entity";
import { SessionEntity } from "./session.entity";
import { Exclude } from "class-transformer";
import { RoleEntity } from "./role.entity";
import { CodeEntity } from "./code.entity";
import { LogEntity } from "./log.entity";

@Entity(DatabaseTableEnum.USER)
export class UserEntity extends BasicEntityProperties {
    @Column({ type: `uuid`, unique: true, generated: true, default: () => "gen_random_uuid()" })
    public uuid: string;

    @Column({ type: `varchar`, length: 64, nullable: true, default: null })
    public email: string;

    @Column({ type: `varchar`, length: 64, nullable: false, unique: true })
    public login: string;

    @Column({ type: `text`, nullable: false, transformer })
    @Exclude()
    public passwordHash: string;

    @Column({ type: `timestamptz`, nullable: true, default: null })
    public blockedAt: Date;

    @Column({ type: `timestamptz`, nullable: true, default: null })
    public activatedAt: Date;

    @Column({ type: `timestamptz`, nullable: true, default: null })
    @Exclude()
    public lastPasswordChange: Date;

    @Column({ type: `timestamptz`, nullable: true, default: null })
    @Exclude()
    public lastLoginAt: Date;

    @OneToMany(() => SessionEntity, (session) => session.user)
    public sessions?: SessionEntity[];

    @OneToMany(() => HttpRequestEntity, (httpRequest) => httpRequest.user)
    public requests?: HttpRequestEntity[];

    @OneToMany(() => RedirectionEntity, (redirection) => redirection.user)
    public redirections?: RedirectionEntity[];

    @OneToMany(() => CodeEntity, (code) => code.user)
    public codes?: CodeEntity[];

    @OneToMany(() => LogEntity, (log) => log.user)
    public logs?: LogEntity[];

    @ManyToMany(() => PermissionEntity, (permission) => permission.users, { nullable: true, onDelete: `CASCADE` })
    @JoinTable({ name: DatabaseRelationTableEnum.PERMISSIONS_ON_USERS })
    public permissions?: PermissionEntity[];

    @ManyToMany(() => RoleEntity, (role) => role.users, { nullable: true, onDelete: `CASCADE` })
    @JoinTable({ name: DatabaseRelationTableEnum.ROLES_ON_USERS })
    public roles?: RoleEntity[];
}
