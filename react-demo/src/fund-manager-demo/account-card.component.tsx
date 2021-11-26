import { DeleteOutlined, EditOutlined, StarOutlined } from '@ant-design/icons';
import { Button,Form,Modal } from 'antd';
import React from 'react';
import { CompanyType, IAccount, IAccountInEdit, IContact } from './model';
import  styles from './account-card.component.module.scss';
import { FieldData } from 'rc-field-form/es/interface';
import _ from 'lodash';
import ContactEditor from './contact-editor.component';
import { MetaConfig } from '../mylib/components/flex-form/interface';
import FlexForm from '../mylib/components/flex-form/flex-form.component';
import { DialogService } from '../mylib/components/dynamic-dialog';


export interface IAccountEditProps{
    initialValue:Partial<IAccount>;
    getCurrentAccounts:()=>IAccountInEdit[];
    saveAccount:(account:IAccountInEdit)=>void;
    closeMe?:()=>void;
}

export const AccountEdit:React.FC<IAccountEditProps>=(props:IAccountEditProps)=>{  
    const {getCurrentAccounts,initialValue,saveAccount,closeMe}  = props;
    const accountEditMeta:MetaConfig[]=[
        {
            name:'companyName',
            label:'公司名称',
            rules:[{required:true},
                {
                    validator:(_,value)=>{
                        return getCurrentAccounts()
                            .map(it=>it.companyName)
                            .filter(it=>!!initialValue.key?.length?
                                it!=initialValue.companyName:
                                true)
                            .includes(value)?
                        Promise.reject('公司名称已经出现在当前的基金下。'):
                        Promise.resolve('');
                    }
                }
            ],
        },
        {
            name:'companyType',
            label:'公司类型',
            rules:[{required:true}],
            options$:Promise.resolve([
                {label:'私有企业',value:CompanyType.private},
                {label:'国有企业',value:CompanyType.public},
                {label:'合资企业',value:CompanyType.hyber},
                {label:'初创公司',value:CompanyType.startup},
                {label:'其他',value:CompanyType.others},
            ]),
            fieldType:'select',
        },
        {
            name:'commitAmount',
            label:'投资金额',
            rules:[{required:true}],  
            fieldType:'inputnumber',
            style:{width:'100%'},
        },
        {
            name:'legalAddress',
            label:'公司注册地址',
            rules:[{required:true}],
        },
    ];
    const [form] = Form.useForm();
    const [formError,setFormError]=React.useState<boolean>(true);
    const onFieldsChange =(changedFields:FieldData[],allFields:FieldData[])=>{        
        setFormError(allFields.filter(it=>!!it.errors?.length).length>0);
    }
    const onSave=(value:IAccountInEdit)=>{
        saveAccount(value);
        form.resetFields();
    }
    let initialAccountValue = _.pick(initialValue,['companyName',
        'commitAmount',
        'legalAddress',
        'companyType',
        ]);
    return (
        <>
            <FlexForm 
                initializeValue={initialAccountValue}
                metas={accountEditMeta}  
                form={form}  
                onFieldsChange={onFieldsChange}   
                onFinish={onSave}       
            >
                <div>
                    <Button htmlType='reset' onClick={()=>closeMe?.()}>取消</Button>
                    <Button disabled={formError}
                        htmlType='submit'
                        >确认</Button>
                </div>
            </FlexForm>        
        </>
    );
}

export interface IAccountCardProps{
    account:IAccountInEdit;
    deleteAccount:(account:IAccountInEdit)=>void;
    getCurrentAccounts:()=>IAccountInEdit[];
    updateAccount:(account:Partial<IAccountInEdit>&Pick<IAccountInEdit,'key'>)=>void;
    upsertContact:(contact:IContact)=>void;
    removeContact:(contact:IContact)=>void;
}

const AccountCard:React.FC<IAccountCardProps>=({account,
    deleteAccount,
    getCurrentAccounts,
    updateAccount,
    upsertContact,
    removeContact,
    }:IAccountCardProps)=>{
    const {companyName,contacts}=account;
    const onRemoveAccount = ()=>{
        Modal.confirm({
            title:'确定',
            content:'你确定要删除这个投资公司吗？',
            onOk:()=>deleteAccount(account),
        });
    }
    const onEditAccount:React.MouseEventHandler<HTMLElement> = (param)=>{        
        const onSaveAccount=(value:IAccountInEdit)=>{
            value.key=account.key;
            updateAccount(value);
            compRef.destory();
        }
        const compRef = DialogService.openComponent({
            title:'编辑投资公司信息',
            content:(
                <AccountEdit initialValue={account} 
                    getCurrentAccounts={getCurrentAccounts} 
                    saveAccount={onSaveAccount}
                    closeMe={()=>{compRef.destory()}}
                    ></AccountEdit>
                ), 
            maskClosable:true,  
            dependedElement:param.currentTarget,      
        });
    }

    const onEditPrimary=(param:React.MouseEvent<HTMLElement, MouseEvent>,contact:IContact)=>{
        const initialValue = _.pick(contact,['isPrimary']);
        let liveValue= initialValue;
        const onSavePrimaryChange=()=>{  
            console.log('save live value',liveValue);
            let updatedContact = {...contact,...liveValue};
            console.log(updatedContact.isPrimary);
            upsertContact(updatedContact);
            compRef.destory();
        }
        const onChange = (value:any)=>{
            Object.assign(liveValue,value);
            console.log('after changte,',liveValue);
        }
        const compRef = DialogService.openComponent({
            content:(
                <FlexForm 
                    initializeValue={initialValue}
                    onChange={onChange}
                >
                </FlexForm>),
            maskClosable:true,  
            dependedElement:param.currentTarget, 
            afterClose:onSavePrimaryChange,
        });
    }

    const onRemoveContact = (contact:IContact)=>{
        Modal.confirm({
            content:'确定要删除这个联系人吗？',
            title:'确定',
            onOk:()=>removeContact(contact),            
        })
    }

    const onCloneContact = (param:React.MouseEvent<HTMLElement, MouseEvent>,contact:IContact)=>{
        const options = getCurrentAccounts().map(it=>({label:it.companyName,value:it.key}));
        const accounts = getCurrentAccounts()
            .filter(it=>it
                .contacts
                .findIndex(each=>each.emailAddress===contact.emailAddress)>=0)
            .map(it=>it.key);
        const metas:MetaConfig[]=[
            {
                name:'accounts',
                fieldType:'multiselect',
                label:'复制信息到其他公司',
                placeholder:'请选择隶属的公司',
                options$:Promise.resolve(options),
                maxTagCount:2,
            }
        ];
        let selectedAccounts = accounts;
        const onChange=({accounts}:any)=>{
            selectedAccounts=accounts;
        }
        const distinctPrimaryContact=(account:IAccountInEdit)=>{
            if(account.contacts.length===0)return;
            let primaryContacts = account.contacts.filter(it=>it.isPrimary);
            if(primaryContacts.length===0){
                account.contacts[0].isPrimary=true;
            }else if(primaryContacts.length>1){
                primaryContacts.forEach((it,index)=>{
                    if(index>0){
                        it.isPrimary=false;
                    }
                })
            }
        }
        const onCloneContacts=()=>{
            let needToAdd = getCurrentAccounts()
                .filter(account=>selectedAccounts.indexOf(account.key)>=0&&
                    !~account.contacts.findIndex(it=>it.emailAddress===contact.emailAddress));
            let needToDelete = getCurrentAccounts()
                .filter(account=>account.contacts.findIndex(it=>it.emailAddress===contact.emailAddress)>=0&&
                    !~selectedAccounts.indexOf(account.key)
                );
            for(let toadd of needToAdd){
                let id = Number.parseInt(/\d+/g.exec(contact.fullName)![0]);
                toadd.contacts.push({...contact,
                    accountId:toadd.key,
                    key:`${toadd.key}-${id}`
                });
                distinctPrimaryContact(toadd);
                updateAccount(toadd);
            }
            for(let todelete of needToDelete){
                todelete.contacts=todelete.contacts.filter(it=>it.emailAddress!=contact.emailAddress);
                distinctPrimaryContact(todelete);
                updateAccount(todelete);
            }
            comRef.destory();
        }
        const initialValueObj={accounts};
        const comRef = DialogService.openComponent({
            content:(
                <FlexForm
                    initializeValue={initialValueObj}
                    onChange={onChange}
                    metas={metas}
                ></FlexForm>
            ),
            maskClosable:true,
            dependedElement:param.currentTarget,
            afterClose:onCloneContacts,
        })
        
    }

    

    const accountLabel = (
        <div className={styles['account-card']}>{companyName} 
            <span>
                <Button icon={<EditOutlined/>} type='link' className={styles['tool']}
                    onClick={onEditAccount}
                />
                <Button icon={<DeleteOutlined/>} type='link' className={styles['tool']} 
                    onClick={onRemoveAccount}/>
            </span>
        </div>);
    const contactList = contacts.map(contact=>(
        <div className={styles['user-card']} key={contact.key}>
            <div style={{position:'absolute',right:'10px'}}>
                <Button icon={<i className="fa fa-toggle-on"></i>} type='link' 
                    className={styles['tool']} onClick={(param)=>onEditPrimary(param,contact)}/>
                <Button icon={<i className="fa fa-clone"></i>} type='link'
                 className={styles['tool']} onClick={(param)=>onCloneContact(param,contact)}/>
                <Button icon={<DeleteOutlined/>} type='link' className={styles['tool']}
                    onClick={()=>onRemoveContact(contact)}
                />
            </div>
            <div>{contact.fullName} <StarOutlined style={{display:contact.isPrimary?'inline':'none',color:'red'}}/></div>
            <div className={styles['link']}>{contact.emailAddress}</div>
        </div>));

    return (
        <div>
            {accountLabel}
            {contactList}
        </div>
    );
}

export default AccountCard;