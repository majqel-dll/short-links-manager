import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { HttpRequestHeaderEntity } from "./http-request-header.entity";
import { HttpIpAddressEntity } from "./http-ip-address.entity";
import { HttpResponseEntity } from "./http-response.entity";
import { DatabaseTableEnum } from "@libs/enums/database";
import { UserEntity } from "./user.entity";
import { LogEntity } from "./log.entity";
import { RedirectionEntity } from "./redirection.entity";

@Entity(DatabaseTableEnum.HTTP_REQUEST)
export class HttpRequestEntity extends BasicEntityProperties {
    @Column({ type: `varchar`, length: 48, unique: true, nullable: false })
    @Index()
    public requestUuid?: string;

    @Column({ type: "timestamptz", nullable: true, default: null })
    public requestTimestamp?: Date;

    @Column({ type: `varchar`, nullable: true, default: null, length: 8 })
    public method?: string;

    @Column({ type: `varchar`, nullable: true, default: null, length: 2048 })
    @Index()
    public url?: string;

    @Column({ type: `varchar`, nullable: true, default: null, length: 2048 })
    public path?: string;

    @Column({ type: `varchar`, nullable: true, default: null, length: 128 })
    public host?: string;

    @Column({ type: `json`, nullable: true, default: null })
    public ipAddresses?: JSON;

    @Column({ type: `varchar`, nullable: true, default: null, length: 128 })
    public hostname?: string;

    @Column({ type: `varchar`, nullable: true, default: null, length: 32 })
    public protocol?: string;

    @Column({ type: `json`, nullable: true, default: null })
    public params?: JSON;

    @Column({ type: `json`, nullable: true, default: null })
    public query?: JSON;

    @Column({ type: `json`, nullable: true, default: null })
    public geolocation?: JSON;

    @Column({ type: `json`, nullable: true, default: null, select: false })
    public body?: JSON;

    @OneToOne(() => HttpResponseEntity, (response) => response.request)
    public response?: HttpResponseEntity;

    @OneToOne(() => HttpRequestHeaderEntity, (headers) => headers.request)
    @JoinColumn()
    public headers?: HttpRequestHeaderEntity;

    @Column({ type: `int`, nullable: true, default: null, select: false })
    @Index()
    public ipId?: number;

    @ManyToOne(() => HttpIpAddressEntity, { eager: true })
    @JoinColumn({ name: `ipId` })
    public ip?: HttpIpAddressEntity;

    @Column({ type: `int`, nullable: true, default: null, select: false })
    @Index()
    public redirectionId?: number;

    @ManyToOne(() => RedirectionEntity)
    @JoinColumn({ name: `redirectionId` })
    public redirection?: RedirectionEntity;


    @Column({ type: `int`, nullable: true, default: null })
    public userId?: number;

    @ManyToOne(() => UserEntity, (user) => user.requests, {
        nullable: true,
        onDelete: `SET NULL`,
    })
    @JoinColumn({ name: `userId` })
    public user?: UserEntity;

    @OneToMany(() => LogEntity, (log) => log.request, { nullable: true })
    public logs?: LogEntity[];


}
