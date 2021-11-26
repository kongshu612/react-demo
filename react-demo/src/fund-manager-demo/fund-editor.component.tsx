import React from 'react';
import {Button, Collapse, ColProps, Form, FormInstance, List} from 'antd';
import { DataSourceContext, IDataSourceContext } from './hooks/useDataSource';
import { PlusCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import FlexFormSimple from '../mylib/components/flex-form/flex-form.component';
import { CompanyType, IAccount, IAccountInEdit, IContact, IContactEdit } from './model';
import { MetaConfig } from '../mylib/components/flex-form/interface';
import {Observable, of} from 'rxjs';
import AccountCard, { AccountEdit } from './account-card.component';
import { FieldData } from 'rc-field-form/lib/interface';
import ContactEditor from './contact-editor.component';
import { useState } from '../mylib/hooks/useState';
const {Panel}=Collapse;


interface FundEditState{
    accountInEdit?:IAccount;
    contactInEdit?:IContact;
    accountList?:IAccountInEdit[];
}
const emptyAccount:Partial<IAccount>={
    companyName: '',
    commitAmount: 0,
    legalAddress: '',
}
const emptyContact:Partial<IContact>={
    fullName:'',
    emailAddress:'',
    phoneNumber:'',
    isPrimary:false,
}


const FundEditor:React.FC=()=>{
    const context = React.useContext<IDataSourceContext>(DataSourceContext);
    const {
        selectCurrentAccounts,
        setCurrentAccounts,
        getCurrentAccounts,
        updateAccount,
        getCurrentFund,
        upsertContact,
        removeContact,
        removeAccount,
        }=context;
    const [state,setState]=useState<FundEditState>({});
    const {
        accountList=[],
    }=state;
    


    React.useEffect(()=>{
        const sub = selectCurrentAccounts().subscribe(accounts=>{
            setState({accountList:accounts});
        });
        return ()=>sub.unsubscribe();
    },[selectCurrentAccounts]);

    const onAddAccount=(account:IAccountInEdit)=>{
        console.log(account);
        account.contacts=[];
        const fundKey = getCurrentFund().key;
        account.key=`${fundKey}-contact-${accountList.length + 1}`;
        setCurrentAccounts([account,...accountList]);
    }
    const onAddContact=(contact:IContact)=>{
        console.log(contact);
        upsertContact(contact);
    }


    
    const addAccount=(
        <Panel key='1' showArrow={false}
         header={<div><PlusCircleOutlined/> 添加一个新的投资公司</div>}>
             <AccountEdit initialValue={emptyAccount} 
                getCurrentAccounts={getCurrentAccounts} 
                saveAccount={onAddAccount}></AccountEdit>
        </Panel>
    );
    const addContact = (
        <Panel key='2' showArrow={false}
         header={<div><UserAddOutlined/> 添加一个新的联系人</div>}>
            <ContactEditor
                contactInEdit={emptyContact}
                getCurrentAccounts={getCurrentAccounts}
                saveContact={onAddContact}
            ></ContactEditor>
        </Panel>
    )
    const editPanel=(
        <Collapse collapsible={'header'}>
            {addAccount}
            {addContact}
        </Collapse>
    )
    const onRemoveAccount = (account:IAccountInEdit) =>{
        removeAccount(account);
        //setState({accountList:accountList.filter(it=>it!==account)})
    }
    const accountListPanel = (
        <List dataSource={accountList}
            renderItem={item => <AccountCard 
                account={item} 
                deleteAccount={onRemoveAccount}
                updateAccount={updateAccount}
                getCurrentAccounts={getCurrentAccounts}
                upsertContact={upsertContact}
                removeContact={removeContact}
                />}
        >
            
        </List>
    )
    return(
        <>
        {editPanel}
        {accountListPanel}
        </>
    );
}

export {FundEditor};