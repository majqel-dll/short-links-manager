import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { DatabaseTableEnum } from "@libs/enums/database";
import { UserEntity } from "./user.entity";

@Entity(DatabaseTableEnum.CODE)
export class CodeEntity extends BasicEntityProperties {

    @Column({ type: `varchar`, length: 10, nullable: false, unique: true })
    @Index({ unique: true })
    public code: string;

    @Column({ type: `boolean`, default: false })
    public isUsed: boolean;

    @Column({ type: `timestamp`, nullable: true, default: null })
    public usedAt: Date;

    @Column({ type: `timestamp`, nullable: true, default: null })
    public expiresAt: Date;

    @Column({ type: `int`, nullable: false, })
    @Index()
    public userId?: number;

    @ManyToOne(() => UserEntity, user => user.codes, { nullable: true, onDelete: `SET NULL` })
    public user?: UserEntity;

}