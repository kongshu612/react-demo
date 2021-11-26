import React from 'react';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IAccount, IAccountInEdit, IContact, IFund } from '../model';

export interface IFundObservable {
    selectFunds: () => Observable<IFund[]>,
    setFunds: (newFunds: IFund[]) => void,
    getFunds: () => IFund[],
}

export interface IAccountObservable {
    selectAccounts: () => Observable<IAccount[]>,
    setAccounts: (newAccounts: IAccount[]) => void,
    getAccounts: () => IAccount[],
}

export interface IContactObservable {
    selectContacts: () => Observable<IContact[]>,
    setContacts: (newContacts: IContact[]) => void,
    getContacts: () => IContact[]
}

export interface ISelectedContactObservable {
    selectSelectedContacts: () => Observable<IContact[]>,
    setSelectedContacts: (param: IContact[]) => void,
    getSelectedContacts: () => IContact[],
}

export interface ICurrentFundObservable {
    setCurrentFund: (fund: IFund) => void,
    getCurrentFund: () => IFund,
    selectCurrentAccounts: () => Observable<IAccountInEdit[]>,
    getCurrentAccounts: () => IAccountInEdit[],
    refreshCurrentAccounts: () => void,
    addAccount: (account: IAccountInEdit) => void,
    removeAccount: (account: IAccountInEdit) => void,
    setCurrentAccounts: (accounts: IAccountInEdit[]) => void,
    updateAccount: (account: Partial<IAccountInEdit> & Pick<IAccountInEdit, 'key'>) => void,
    upsertContact: (contact: IContact) => void;
    removeContact: (contact: IContact) => void;
}

export interface IDataSourceContext extends IFundObservable,
    IAccountObservable,
    IContactObservable,
    ISelectedContactObservable,
    ICurrentFundObservable {

}

const getDefaultContext: () => IDataSourceContext = () => {
    return <IDataSourceContext>({
        selectFunds: () => [],
        setFunds: () => { },
        getFunds: () => [],

        selectAccounts: () => [],
        setAccounts: () => { },
        getAccounts: () => [],

        selectContacts: () => [],
        setContacts: () => { },
        getContacts: () => [],

        setSelectedContacts: () => { },
        selectSelectedContacts: () => [],
        getSelectedContacts: () => [],

        selectCurrentAccounts: () => [],
        getCurrentAccounts: () => [],
        setCurrentAccounts: (accounts: IAccountInEdit[]) => { },
        refreshCurrentAccounts: () => { },
        addAccount: (account: IAccountInEdit) => { },
        removeAccount: (account: IAccountInEdit) => { },
        getCurrentFund: () => { },
        setCurrentFund: (fund: IFund) => { },
        updateAccount: (account: Partial<IAccountInEdit> & Pick<IAccountInEdit, 'key'>) => { },
        upsertContact: (contact: IContact) => { },
        removeContact: (contact: IContact) => { },
    } as unknown);
}


export function getContext(): IDataSourceContext {
    let _accounts: IAccount[] = [];
    let _funds: IFund[] = [];
    let _contacts: IContact[] = [];
    let _selectedContacts: IContact[] = [];
    let _currentAccounts: IAccountInEdit[] = [];
    let _currentFund: IFund;
    let subject = {
        funds: new BehaviorSubject<IFund[]>(_funds),
        accounts: new BehaviorSubject<IAccount[]>(_accounts),
        contacts: new BehaviorSubject<IContact[]>(_contacts),
        selectedContacts: new BehaviorSubject<IContact[]>(_selectedContacts),
        currentAccounts: new BehaviorSubject<IAccountInEdit[]>(_currentAccounts),
    }
    let observables = {
        funds$: subject.funds.asObservable(),
        accounts$: subject.accounts.asObservable(),
        contacts$: subject.contacts.asObservable(),
        selectedContacts$: subject.selectedContacts.asObservable(),
        currentAccounts$: subject.currentAccounts.asObservable(),
    }
    const selectFunds = () => observables.funds$;
    const setFunds = (newFunds: IFund[]) => {
        _funds = newFunds;
        subject.funds.next(_funds);
    }
    const getFunds = () => _funds;

    const selectAccounts = () => observables.accounts$;
    const setAccounts = (newAccounts: IAccount[]) => {
        _accounts = newAccounts;
        subject.accounts.next(_accounts);
    }
    const getAccounts = () => _accounts;

    const selectContacts = () => observables.contacts$;
    const setContacts = (newContacts: IContact[]) => {
        _contacts = newContacts;
        subject.contacts.next(_contacts);
    }
    const getContacts = () => _contacts;

    const selectSelectedContacts = () => observables.selectedContacts$;
    const setSelectedContacts = (param: IContact[]) => {
        _selectedContacts = param;
        subject.selectedContacts.next(_selectedContacts);
    }
    const getSelectedContacts = () => _selectedContacts;

    const setCurrentAccounts = (accounts: IAccountInEdit[]) => {
        _currentAccounts = accounts;
        refreshCurrentAccounts();
    }
    const selectCurrentAccounts = () => observables.currentAccounts$;
    const getCurrentAccounts = () => _currentAccounts;
    const refreshCurrentAccounts = () => {
        subject.currentAccounts.next(_currentAccounts);
    };
    const addAccount = (account: IAccountInEdit) => {
        _currentAccounts.unshift(account);
        refreshCurrentAccounts();
    };
    const removeAccount = (account: IAccountInEdit) => {
        _currentAccounts = _currentAccounts.filter(it => it != account);
        refreshCurrentAccounts();
    }
    const getCurrentFund = () => _currentFund;
    const setCurrentFund = (fund: IFund) => {
        _currentFund = fund;
    }
    const updateAccount = (account: Partial<IAccountInEdit> & Pick<IAccountInEdit, 'key'>) => {
        const { key } = account;
        let original = _currentAccounts.find(it => it.key === key);
        Object.assign(original, account);
        refreshCurrentAccounts();
    }
    const upsertContact = (contact: IContact) => {
        const account = _currentAccounts.find(it => it.key === contact.accountId);
        let index = account!.contacts.findIndex(it => it.key === contact.key);
        if (index >= 0) {
            account?.contacts.splice(index, 1, contact);
        } else {
            account?.contacts.unshift(contact);
        }
        consolidatePrimaryContact(account!, contact);
        refreshCurrentAccounts();
    }
    const removeContact = (contact: IContact) => {
        const account = _currentAccounts.find(it => it.key === contact.accountId);
        if (account) {
            account.contacts = account.contacts.filter(it => it !== contact);
            consolidatePrimaryContact(account);
            refreshCurrentAccounts();
        }
    }

    const consolidatePrimaryContact = (account: IAccountInEdit, contact?: IContact) => {
        let primaryIndex = account.contacts.findIndex(it => it.isPrimary === true);
        if (primaryIndex < 0) {
            primaryIndex = 0;
        }
        if (contact?.isPrimary) {
            primaryIndex = account.contacts.findIndex(it => it === contact);
        }
        account.contacts.forEach((it, index) => {
            it.isPrimary = index === primaryIndex;
        })
    }

    return {
        selectFunds, setFunds, getFunds,
        selectAccounts, setAccounts, getAccounts,
        selectContacts, setContacts, getContacts,
        selectSelectedContacts, setSelectedContacts, getSelectedContacts,
        selectCurrentAccounts, refreshCurrentAccounts, addAccount, removeAccount, setCurrentAccounts, getCurrentFund, setCurrentFund, getCurrentAccounts, updateAccount, upsertContact, removeContact,
    };
}


export const DataSourceContext = React.createContext<IDataSourceContext>(getDefaultContext());