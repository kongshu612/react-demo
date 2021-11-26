import React from 'react';
import { MetaConfig } from '../mylib/components/flex-form/interface';
import { IAccount, IAccountInEdit, IContact, IContactEdit } from './model';
import FlexFormSimple from '../mylib/components/flex-form/flex-form.component';
import _ from 'lodash';
import { useForm } from 'antd/lib/form/Form';
import { Button } from 'antd';
import { FieldData } from 'rc-field-form/lib/interface';

export interface IContactEditorProps{
    contactInEdit:Partial<IContactEdit>;
    saveContact:(contact:IContact)=>void;
    closeMe?:()=>void;
    getCurrentAccounts:()=>IAccountInEdit[];
}

const ContactEditor:React.FC<IContactEditorProps>=(props)=>{
    const {contactInEdit,closeMe,saveContact,getCurrentAccounts}=props;
    const contactEditMeta:MetaConfig[]=[
        {
            name:'fullName',
            label:'姓名',
            rules:[{required:true}],
        },
        {
            name:'emailAddress',
            label:'邮箱地址',
            rules:[{required:true},{type:'email'}],
        },
        {
            name:'phoneNumber',
            label:'电话号码',
            rules:[{required:true}]
        },
        {
            name:'isPrimary',
            label:'是否为主要联系人',
            fieldType:'switch',
        },
        {
            name:'accountId',
            label:'隶属的公司',
            fieldType:'select',
            rules:[{required:true}],
            options$:Promise.resolve(getCurrentAccounts().map(it=>({label:it.companyName,value:it.key})))
        }
    ];
    const [form]=useForm();
    const initialValue = _.omit(contactInEdit,'key');
    const [formError,setFormError]=React.useState(true);
    const originalKey = (contactInEdit as any)['key'] as string;

    const onFieldsChange = (changedFields:FieldData[],allFields:FieldData[])=>{
        setFormError(allFields.filter(it=>it.errors?.length)?.length>0);
    }
    const onSaveContact = (value:IContactEdit)=>{
        let currentContactCount = getCurrentAccounts()
            .find(it=>it.key===value.accountId)
            ?.contacts
            ?.length ??0;
        let key = !!originalKey?.length?originalKey:`${value.accountId}-${currentContactCount+1}`
        saveContact({...value,key});
        form.resetFields();
    }
    return (
        <FlexFormSimple 
            initializeValue={initialValue}
            metas={contactEditMeta}
            form={form}
            onFieldsChange={onFieldsChange}
            onFinish={onSaveContact}
        >
            <div>
                    <Button htmlType='reset' onClick={()=>closeMe?.()}>取消</Button>
                    <Button disabled={formError}
                        htmlType='submit'
                        >确认</Button>
                </div>
        </FlexFormSimple>
    )
}

export default ContactEditor;