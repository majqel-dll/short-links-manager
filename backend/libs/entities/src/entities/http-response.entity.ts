import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { HttpRequestEntity } from "./http-request.entity";
import { DatabaseTableEnum } from "@libs/enums/database";

@Entity(DatabaseTableEnum.HTTP_RESPONSE)
export class HttpResponseEntity extends BasicEntityProperties {

    @Column({ type: `bigint`, nullable: true, default: null })
    public size?: number;

    @Column({ type: `json`, nullable: true, default: null })
    public error?: JSON;

    @Column({ type: `smallint`, nullable: true, default: null })
    public statusCode?: number;

    @Column({ type: `int`, nullable: true, default: null })
    public duration?: number;

    @Column({ type: `varchar`, length: 48, nullable: true, default: null })
    public requestUuid?: string;

    @OneToOne(() => HttpRequestEntity, request => request.response, {
        eager: true,
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: `requestUuid`, referencedColumnName: `requestUuid` })
    public request?: HttpRequestEntity

};