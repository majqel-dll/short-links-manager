export type ChangePasswordPayload = {
    password: string,
    newPassword: string,
    confirmPassword: string,
    userId?: number,
}

export type DeactivateUserPayload = {
    login?: string,
    password?: string,
    id?: string,
}

export type Permissions = string[];

export type Code = {
    id: number,
    userId: number,
    status: boolean,
    expireDate: number,
    email: string,
}

export type UpdateUserBody = {
    adminToken: string,
    id: number,
    newLogin?: string,
    newPassword?: string,
    newEmail?: string,
}


export type NewUserBody = {
    login: string,
    password: string,
    email?: string,
    canCreate: boolean,
    canUpdate: boolean,
    canDelete: boolean,
    canManage: boolean,
}

export type Redirection = {
    id?: number,
    targetUrl: string,
    route: string,
    userId: number,
    category?: string,
    clicksTotal?: number,
    clicks30d?: number,
}

export type RequestData = {
    id: number,
    requestIp: string,
    redirectionId: number,
    requestTime: number,
}

export type UpdateEmailProps = {
    newEmail?: string,
    emailSent: boolean
}

export type Log = {
    id?: number,
    label: string,
    description: string,
    status: string,
    duration: string,
    jstimestamp?: number,
}

export type QueryParams = {
    maxCount?: number,
    offset?: number,
    maxDate?: string,
    minDate?: string,
}

export type RegisterProps = {
    login: string,
    password: string,
    confirmPassword: string,
}

export type Route = {
    title: string,
    route: string,
}

export type LoggerProps = {
    label: string,
    description: string,
    startTime: number,
    err?: Error,
}

export type DTOs = any;
export type CRUDTypes = any;

export type findMultipleElementsProps = {
    endpoint: string,
    conditions?: QueryConditions,
}

export type findSingleElementByIdProps = {
    endpoint: string,
    id: number,
}

export type findMultipleElementsByParamProps = {
    endpoint: string,
    param: string,
    value: string | number,
    conditions?: QueryConditions,
}

export type createMultipleElementsProps = {
    endpoint: string,
    dataArray: CRUDTypes[],
}

export type createSingleElementProps = {
    endpoint: string,
    data: CRUDTypes,
}

export type updateSingleElementProps = {
    endpoint: string,
    id: number,
    data: CRUDTypes,
}

export type patchSingleElementProps = {
    endpoint: string,
    id: number,
    data: CRUDTypes,
}

export type patchMultipleElementsByParamProps = {
    endpoint: string,
    param: string,
    value: string | number,
    data: CRUDTypes,
}

export type deleteSingleElementByIdProps = {
    endpoint: string,
    id: number,
}

export type deleteMultipleElementsByParamProps = {
    endpoint: string,
    param: string,
    value: string | number,
}

export type QueryConditions = {
    maxCount?: number,
    offset?: number,
    minDate?: string,
    maxDate?: string,
}

export type RegisterUser = {
    login: string,
    password: string,
    confirmPassword: string,
    req?: any,
}

export type LoginUser = {
    login: string,
    password: string,
    req?: any,
}

export type LogoutUser = {
    login: string,
    accessToken: string,
}

export type RemoveUserProps = {
    login: string,
    password: string,
}

export type CodeWithoutDetails = {
    id: number,
    userId: number,
    status: boolean,
    expireDate: number,
    email: string,
}

export type TransportDataType = {
    service: string,
    host: string,
    port: string,
    secure: boolean,
    auth: SmtpAuth,
}

export type SmtpAuth = {
    user: string,
    pass: string,
}