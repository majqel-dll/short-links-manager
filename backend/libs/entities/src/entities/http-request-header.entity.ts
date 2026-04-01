import { BasicEntityProperties } from "../partials/basic-entity-properties";
import { DatabaseTableEnum } from "@libs/enums/database";
import { Entity } from "typeorm";

@Entity(DatabaseTableEnum.HTTP_REQUEST_HEADER)
export class HttpRequestHeaderEntity extends BasicEntityProperties {

}