export interface Organization {
    token: string,
    admin: string,  
    name: string,
    tokenName: string,
    tokenTicker: string,
}

export interface Vest {
    availableAfterTimestamp: number;
    amount: number;
    claimed: boolean;
}

export interface Member {
    address: string,
    role: string,
    vests: Vest[]
}

export interface OrganizationInformation {
    org: Organization|undefined,
    members: Member[]|undefined
}