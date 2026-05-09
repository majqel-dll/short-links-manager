import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { HttpRequestEntity } from "./http-request.entity";
import { DatabaseTableEnum } from "@libs/enums/database";
import { UserEntity } from "./user.entity";
import { Exclude } from "class-transformer";

@Entity(DatabaseTableEnum.REDIRECTION)
@Index(`UQ_redirection_route_premium`, [`route`], {
    unique: true,
    where: `"isPremium" = true`,
})
@Index(`UQ_redirection_userId_route_nonpremium`, [`userId`, `route`], {
    unique: true,
    where: `"isPremium" = false`,
})
export class RedirectionEntity extends BasicEntityProperties {
    @Column({ type: `varchar`, length: 2048, nullable: false })
    public targetUrl: string;

    @Column({ type: `varchar`, length: 128 })
    @Index()
    public route: string;

    @Column({ type: `boolean`, default: false })
    public isPremium: boolean;

    @Column({ type: `varchar`, length: 64, nullable: true, default: null })
    public category?: string;

    @Column({ type: `int`, nullable: false })
    @Index()
    public userId: number;

    @ManyToOne(() => UserEntity, (user) => user.redirections, {
        nullable: true,
        onDelete: `CASCADE`,
    })
    @JoinColumn({ name: `userId` })
    public user: UserEntity;

    @OneToMany(() => HttpRequestEntity, (request) => request.redirection, {
        nullable: true,
    })
    @Exclude()
    public httpRequests?: HttpRequestEntity[];
}
