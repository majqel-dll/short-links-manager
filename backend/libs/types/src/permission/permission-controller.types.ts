import { BasicEntityProperties } from "@libs/entities/partials/basic-entity-properties";

export type GetEntitiesResponse<T extends BasicEntityProperties> = {
    data: T[];
    meta: GetEntityResponseMeta;
}

export type GetEntityResponseMeta = {
    totalRecords: number,
    currentPage: number,
    pageSize: number,
    totalPages: number,
}