import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { HttpRequestEntity } from "./http-request.entity";
import { DatabaseTableEnum } from "@libs/enums/database";
import { LogLabelEnum, LogTypeEnum } from "@libs/enums";
import { UserEntity } from "./user.entity";

@Entity(DatabaseTableEnum.LOG)
export class LogEntity extends BasicEntityProperties {
    @Column({ type: `text`, nullable: false })
    public content: string;

    @Column({ type: `enum`, enum: LogLabelEnum, nullable: true, default: null })
    public label?: LogLabelEnum;

    @Column({ type: `enum`, enum: LogTypeEnum, nullable: true, default: null })
    public tag?: LogTypeEnum;

    @Column({ type: `int`, default: null, nullable: true })
    public duration?: number;

    @Column({ type: `text`, nullable: true, default: null })
    public error?: string;

    @Column({ type: `int`, nullable: true, default: null })
    public userId?: number;

    @ManyToOne(() => UserEntity, (user) => user.logs, {
        nullable: true,
        onDelete: `SET NULL`,
    })
    @JoinColumn({ name: `userId` })
    public user?: UserEntity;

    @Column({ type: `int`, nullable: true, default: null })
    public requestId?: number;

    @ManyToOne(() => HttpRequestEntity, (request) => request.logs, {
        nullable: true,
        onDelete: `SET NULL`,
    })
    @JoinColumn({ name: `requestId` })
    public request?: HttpRequestEntity;
}
