import { BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { HttpIpAddressEntity } from "./http-ip-address.entity";
import { DatabaseTableEnum } from "@libs/enums";
import { UserEntity } from "./user.entity";
import { Exclude } from "class-transformer";

@Entity(DatabaseTableEnum.SESSION)
export class SessionEntity extends BasicEntityProperties {
    @Column({ type: `varchar`, length: 48, nullable: false })
    @Exclude()
    @Index()
    public sessionId: string;

    @Column({ type: `boolean`, default: true })
    public isActive: boolean;

    @Column({ type: `timestamptz`, nullable: true, default: null })
    public expiresAt: Date;

    @Column({ type: `int`, nullable: false })
    @Exclude()
    @Index()
    public userId: number;

    @ManyToOne(() => UserEntity, (user) => user.sessions, { onDelete: `CASCADE` })
    @JoinColumn({ name: `userId` })
    @Exclude()
    public user: UserEntity;

    @Column({ type: `int`, nullable: true, default: null })
    @Exclude()
    public ipId?: number;

    @ManyToOne(() => HttpIpAddressEntity, (ip) => ip.sessions, {
        nullable: true,
        onDelete: `SET NULL`,
        eager: true,
    })
    @Exclude()
    @JoinColumn({ name: `ipId` })
    public ip?: HttpIpAddressEntity;

    public isKeyFresh() {
        if (!this.isActive) {
            return false;
        }
        if (!this.expiresAt) {
            return true;
        }
        const now = new Date();
        return now < this.expiresAt;
    }

    @BeforeUpdate()
    public checkIfTokenIsFresh() {
        if (!this.isKeyFresh()) {
            this.isActive = false;
        }
    }
}
