import { IAccount, IAccountInEdit, IContact, IFund } from "../model";
import _ from 'lodash';

export function mockData(totalFund: number): {
    funds: IFund[],
    accounts: IAccount[],
    contacts: IContact[],
    fund: IFund,
    currentAccounts: IAccountInEdit[],
} {
    const funds = mockFunds(totalFund);
    const accounts = mockAccounts(totalFund);
    const contacts = mockContacts(accounts.map(it => it.key));
    const fund: IFund = { key: `fund-${totalFund + 2}`, fundName: `基金${totalFund + 2}` };
    const fundKey = fund.key;
    const accountNumber = Math.ceil(Math.random() * 30);
    const currentAccounts = new Array(accountNumber).fill(1).map((_, i) => <IAccountInEdit>({
        key: `${fundKey}-account-${i + 1}`,
        companyName: `某某投资公司${i + 1}`,
        commitAmount: Math.ceil(Math.random() * 1000000),
        companyType: Math.floor(Math.random() * 5),
        legalAddress: '',
        fundId: fundKey,
    }));
    const currentContacts = mockContacts(currentAccounts.map(it => it.key));
    for (let account of currentAccounts) {
        const { key } = account;
        account.contacts = currentContacts.filter(it => it.accountId === key);
    }
    return { funds, accounts, contacts, fund, currentAccounts };
}

export function mockFunds(total: number): IFund[] {
    return new Array(total).fill(1).map((it, index) => ({
        key: `fund-${index + 1}`,
        fundName: `基金${index + 1}`,
    }));
}

export function mockAccounts(totalFund: number): IAccount[] {
    return _.flatten(new Array(totalFund).fill(1).map((it, index) => {
        const fundKey = `fund-${index + 1}`;
        const accountNumber = Math.ceil(Math.random() * 30);
        return new Array(accountNumber).fill(1).map((_, i) => <IAccount>({
            key: `${fundKey}-account-${i + 1}`,
            companyName: `某某投资公司${i + 1}`,
            commitAmount: Math.ceil(Math.random() * 1000000),
            companyType: Math.floor(Math.random() * 5),
            legalAddress: '',
            fundId: fundKey,
        }));
    }));
}

export function mockContacts(accountIds: string[]): IContact[] {
    return _.flatten(accountIds.map(accountId => {
        const contactCount = Math.max(Math.floor(Math.random() * 5), 1);
        return mockUser(contactCount, accountId);
    }))
}

function mockUser(totalCount: number, accountId: string): IContact[] {
    let ids = new Array(totalCount).fill(1).map(() => Math.ceil(Math.random() * 100));
    let distinctIds = [...new Set(ids)];
    return distinctIds.map((id, index) => ({
        accountId,
        fullName: `user${id} mock`,
        emailAddress: `user${id}.mock@mock.com`,
        phoneNumber: `phonenumber${id}`,
        key: `${accountId}-${id}`,
        isPrimary: index === 0
    }));
}