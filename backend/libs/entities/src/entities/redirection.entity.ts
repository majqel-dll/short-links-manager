import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { DatabaseTableEnum } from "@libs/enums/database";
import { UserEntity } from "./user.entity";

@Entity(DatabaseTableEnum.REDIRECTION)
export class RedirectionEntity extends BasicEntityProperties {
    @Column({ type: `varchar`, length: 2048, nullable: false })
    public targetUrl: string;

    @Column({ type: `varchar`, length: 128, unique: true })
    @Index()
    public route: string;

    @Column({ type: `int`, nullable: false })
    @Index()
    public userId: number;

    @ManyToOne(() => UserEntity, (user) => user.redirections, { nullable: true, onDelete: `CASCADE` })
    @JoinColumn({ name: `userId` })
    public user: UserEntity;

    @Column({ type: `varchar`, length: 64, nullable: true, default: null })
    public category?: string;
}
