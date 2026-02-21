import { Entity } from "typeorm";
import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { DatabaseTableEnum } from "@libs/enums/database";

@Entity(DatabaseTableEnum.HTTP_RESPONSE)
export class HttpResponseEntity extends BasicEntityProperties {

};