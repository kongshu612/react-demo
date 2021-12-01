import { PlusCircleOutlined } from '@ant-design/icons';
import React from 'react';
import './fund-demo.scss';
import { DataSourceContext, getContext, IDataSourceContext } from './hooks/useDataSource';
import { IAccountInEdit, IContact, IContactEdit } from './model';
import { mockData, mockFunds } from './utlis/mock';
import classNames from 'classnames';
import { FundList } from './fund-list.component';
import { FundEditor } from './fund-editor.component';

const FundDemo:React.FC=()=>{
    const context = React.useMemo(()=>getContext(),[]);

    const {setFunds,setAccounts,setContacts,
        selectSelectedContacts,getAccounts,setCurrentAccounts,
        setCurrentFund,getCurrentFund,getCurrentAccounts,upsertContact,
        addAccount,setSelectedContacts
    }=context;
    React.useEffect(()=>{
        // Mock to load data from remote server
        setTimeout(()=>{
            const {funds,accounts,contacts,currentAccounts,fund}=mockData(100);
            setFunds(funds);
            setAccounts(accounts);
            setContacts(contacts);
            setCurrentFund(fund);
            setCurrentAccounts(currentAccounts);
        },1000);
    },[]);

    const [checkedContacts,setCheckedContacts]=React.useState<IContact[]>([]);
    React.useEffect(()=>{
        const sub =selectSelectedContacts().subscribe(
            contacts=>{
                setCheckedContacts(contacts);
            }
        );
        return ()=>sub.unsubscribe();
    },[selectSelectedContacts]);

    const transferClassName =  classNames(
        'btn-transfer-right',
        {
            'disabled':!checkedContacts?.length,
        },
    );

    const includeToFund=()=>{
        let accounts:{[k:string]:IAccountInEdit}={};
        let fundId=getCurrentFund().key;
        for(let contact of checkedContacts){
            const {accountId}=contact;
            if(accounts[accountId]===undefined){
                let account:IAccountInEdit={
                    ...getAccounts()
                        .find(it=>it.key===accountId)!,
                    contacts:[],
                    fundId,
                    key:'',                    
                    };
                accounts[accountId]=account;                
            }
            accounts[accountId].contacts.push({...contact,accountId:'',key:'',});
        }
        for(let account of Object.values(accounts)){
            let existingAccount = getCurrentAccounts().find(it=>it.companyName===account.companyName);
            if(existingAccount){
                for(let contact of account.contacts){
                    let {fullName}=contact;
                    let {key:accountId}=existingAccount;
                    let id = Number.parseInt(/\d+/g.exec(fullName)![0]);
                    let toinsert:IContact={
                        ...contact,
                        accountId,
                        key:`${accountId}-${id}`,
                    };
                    upsertContact(toinsert);
                }
            }else{
                let accountToAdd:IAccountInEdit={
                    ...account,
                    key:`${fundId}-account-${getCurrentAccounts().length}`
                };
                accountToAdd.contacts=account.contacts.map((contact)=>({
                    ...contact,
                    accountId:accountToAdd.key,
                    key:`${accountToAdd.key}-${ Number.parseInt(/\d+/g.exec(contact.fullName)![0])}`
                }));
                addAccount(accountToAdd);
            }
        }

        setSelectedContacts([]);
    }

    return (
        <div className="demo-wrapper">
            <h1>基金管理页面。自定义的状态管理器实现多组件之间的通信</h1>
            <p>左边是历史投资人的信息，右边是待投资的基金，选择投资人信息，导入到新的基金里面，假设投资公司名称保持不变</p>
            
            <DataSourceContext.Provider value={context}>
                <div className="fund-wrapper">
                    <div className="left">
                        <FundList/>
                    </div>
                    <div className='transfer' >
                        <div className="center" onClick={()=>includeToFund()}>
                            <div className={transferClassName} >
                                <PlusCircleOutlined style={{fontSize:'16px',color:'white'}}/>
                            </div>
                            <div className='label'>添加</div>
                        </div>
                    </div>
                    <div className="right">
                        <FundEditor/>
                    </div>
                </div>
            </DataSourceContext.Provider>
            
        </div>
    );
}

export default FundDemo;

