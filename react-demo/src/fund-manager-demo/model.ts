export interface IFund {
    key: string;
    fundName: string;
}

export interface IAccount {
    key: string;
    companyName: string;
    companyType: CompanyType;
    commitAmount: number;
    legalAddress: string;
    fundId: string;
}

export interface IAccountInEdit extends IAccount {
    contacts: IContact[];
}

export interface IContact {
    key: string;
    fullName: string;
    emailAddress: string;
    phoneNumber: string;
    isPrimary: boolean;
    accountId: string;
}

export type IContactEdit = Omit<IContact, 'key'>;

export enum CompanyType {
    private,
    public,
    hyber,
    startup,
    others,
}