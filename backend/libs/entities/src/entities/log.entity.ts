import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { DatabaseTableEnum } from "@libs/enums/database";
import { Entity } from "typeorm";

@Entity(DatabaseTableEnum.LOG)
export class LogEntity extends BasicEntityProperties {

};