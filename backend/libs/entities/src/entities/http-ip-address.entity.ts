import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { HttpRequestEntity } from "./http-request.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { SessionEntity } from "./session.entity";
import { DatabaseTableEnum } from "@libs/enums";

@Entity(DatabaseTableEnum.IP_ADDRESS)
export class HttpIpAddressEntity extends BasicEntityProperties {
    @Column({ type: `varchar`, nullable: false, length: 64, unique: true })
    public value: string;

    @Column({ type: `timestamptz`, nullable: true, default: null })
    public blockedAt?: Date;

    @OneToMany(() => HttpRequestEntity, (request) => request.ip, { nullable: true })
    public httpRequests?: HttpRequestEntity[];

    @OneToMany(() => SessionEntity, (session) => session.ip, { nullable: true })
    public sessions?: SessionEntity[];
}
