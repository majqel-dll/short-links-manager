import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { DatabaseTableEnum } from "@libs/enums/database";
import { Entity } from "typeorm";

@Entity(DatabaseTableEnum.USER)
export class UserEntity extends BasicEntityProperties {

    

};