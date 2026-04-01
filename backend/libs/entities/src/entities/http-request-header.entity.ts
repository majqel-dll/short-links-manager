import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { EncryptionTransformer as transformer } from "@libs/utils";
import { DatabaseTableEnum } from "@libs/enums/database";
import { Column, Entity, Index, OneToOne } from "typeorm";
import { HttpRequestEntity } from "./http-request.entity";
@Entity(DatabaseTableEnum.HTTP_REQUEST_HEADER)
export class HttpRequestHeaderEntity extends BasicEntityProperties {
    @Column({ type: `text`, nullable: true, default: null, transformer })
    public userAgent?: string;

    @Column({ type: `text`, nullable: true, default: null })
    public accept?: string;

    @Column({ type: `text`, nullable: true, default: null })
    public acceptEncoding?: string;

    @Column({ type: `varchar`, nullable: true, default: null, length: 512 })
    @Index()
    public referer?: string;

    @Column({ type: `varchar`, nullable: true, default: null, length: 512 })
    public origin?: string;

    @Column({ type: `varchar`, nullable: true, default: null, length: 512 })
    public host?: string;

    @Column({ type: `varchar`, nullable: true, default: null, length: 128 })
    public contentType?: string;

    @OneToOne(() => HttpRequestEntity, (request) => request.headers)
    public request?: HttpRequestEntity;
}
