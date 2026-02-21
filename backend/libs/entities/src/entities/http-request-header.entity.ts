import { Entity } from "typeorm";
import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { DatabaseTableEnum } from "@libs/enums/database";

@Entity(DatabaseTableEnum.HTTP_REQUEST_HEADER)
export class HttpRequestHeaderEntity extends BasicEntityProperties {

}