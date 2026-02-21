import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { DatabaseTableEnum } from "@libs/enums/database";
import { Column, Entity } from "typeorm";

@Entity(DatabaseTableEnum.USER)
export class UserEntity extends BasicEntityProperties {

    @Column({ type: `varchar`, length: `128`, unique: true, nullable: false })
    public login: string;

    @Column({ type: `text` })
    public password: string;
    
};