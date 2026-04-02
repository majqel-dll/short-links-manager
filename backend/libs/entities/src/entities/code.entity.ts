import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { DatabaseTableEnum } from "@libs/enums/database";
import { UserEntity } from "./user.entity";

@Entity(DatabaseTableEnum.CODE)
export class CodeEntity extends BasicEntityProperties {
    @Column({ type: `varchar`, length: 10, nullable: false })
    public code: string;

    @Column({ type: `timestamptz`, nullable: true, default: null })
    public usedAt: Date;

    @Column({ type: `timestamptz`, nullable: true, default: null })
    public expiresAt: Date;

    @Column({ type: `int`, nullable: true })
    @Index()
    public userId?: number;

    @ManyToOne(() => UserEntity, (user) => user.codes, {
        nullable: true,
        onDelete: `SET NULL`,
    })
    @JoinColumn({ name: `userId` })
    public user?: UserEntity;
}
