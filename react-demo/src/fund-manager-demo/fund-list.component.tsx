import React, { Key } from 'react';
import { DataSourceContext, IDataSourceContext } from './hooks/useDataSource';
import { IAccount, IContact, IFund } from './model';
import {Input, Select, Tree} from 'antd';
import { LabeledValue } from 'antd/lib/select';
import './fund-list.scss';
import { SearchOutlined } from '@ant-design/icons';
import { TreeDataNode } from 'rc-tree-select/lib/interface';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import _ from 'lodash';
import { useState } from '../mylib/hooks/useState';

interface ISelectOption extends LabeledValue{
    data:any;
}

interface ITreeNode extends TreeDataNode{
    data:IAccount|IContact;
    fundId:string;
}

interface IFundEditState{
    funds:ISelectOption[],
    accounts:ISelectOption[],
    contacts:ITreeNode[],
    activeFund:ISelectOption|null,
    activeAccount:ISelectOption|null,
    searchKeyWord:string,
    selectedContacts:ITreeNode[]|null,
}
const defaultFundState:IFundEditState={
    funds:[],
    accounts:[],
    contacts:[],
    activeAccount:null,
    activeFund:null,
    searchKeyWord:'',
    selectedContacts:null,
}

const FundList:React.FC=()=>{
    const context = React.useContext<IDataSourceContext>(DataSourceContext);
    const {selectFunds,selectAccounts,selectContacts,setSelectedContacts,
        selectCurrentAccounts,selectSelectedContacts}=context;
    const [state,setState]=useState<IFundEditState>(defaultFundState);
    const {funds,accounts,contacts,activeAccount,activeFund,searchKeyWord,selectedContacts}=state;
    const [contactKeys,setContactKeys]=useState<{checked:Key[],halfChecked:Key[]}|Key[]>([]);
    // Initialize
    React.useEffect(()=>{
        const sub = selectFunds().subscribe(f=>{
            let funds = [...f||[]].map(it=>({
                label:it.fundName,
                value:it.key,
                data:it,
                key:it.key,
            }));
            setState({funds});
        })

        return ()=>sub.unsubscribe();
    },[selectFunds]);
    React.useEffect(()=>{
        const sub = selectAccounts().subscribe(param=>{
            let accounts =[...param||[]].map(it=>({
                label:it.companyName,
                value:it.key,
                key:it.key,
                data:it,
            }));
            setState({accounts});
        });        
            
        return ()=>sub.unsubscribe();
    },[selectAccounts]);
    React.useEffect(()=>{
        const sub = combineLatest([selectAccounts(),selectContacts(),selectCurrentAccounts()]).pipe(
            map(([accounts,contacts,currentAccounts])=>{
                return accounts.map(account=>{
                    const currentAccount = currentAccounts.find(it=>it.companyName===account.companyName);
                    let existingContacts=new Set();
                    if(currentAccount&&currentAccount.contacts.length>0){
                        existingContacts=new Set(currentAccount.contacts.map(it=>it.emailAddress));
                    }
                    const children = contacts
                        .filter(contact=>contact.accountId===account.key)
                        .map(contact =>({
                            key:contact.key,
                            data:contact,
                            title:(<div className='user-card'>
                                <div>{`${contact.fullName}`}</div>
                                <div className='link'>{`${contact.emailAddress}`}</div>
                            </div>),
                            disabled:existingContacts.has(contact.emailAddress),
                        }));
                    let parentNode:ITreeNode={
                        title:`${account.companyName}  (${children.length}联系人)`,
                        key:account.key,
                        fundId:account.fundId,
                        data:account,
                        children,
                        disabled:children.filter(it=>!it.disabled).length===0,
                    }
                    return parentNode;
                })
            })
        ).subscribe(treenodes=>{
            setState({contacts:treenodes});
        });

        return ()=>sub.unsubscribe();
    },[selectContacts,selectAccounts]);
    React.useEffect(()=>{
        const sub = selectSelectedContacts().subscribe(contacts=>{
            setContactKeys(contacts.map(it=>it.key));
        });
        return ()=>sub.unsubscribe();
    },[selectSelectedContacts]);

    const accountsInDisplay = accounts
        .filter(it=>!activeFund||(it.data as IAccount).fundId === activeFund.key);
    const contactsInDisplay = contacts
        .filter(it=>it.fundId===activeFund?.key && 
            (!activeAccount || it.key === activeAccount.key))
        .filter(it=>!searchKeyWord?.length||
            (it.data as IAccount).companyName.includes(searchKeyWord)||
            it.children!.filter(child=>{
                const contact = (child as ITreeNode).data as IContact;
                return `${contact.fullName}`.includes(searchKeyWord)||
                    contact.emailAddress.includes(searchKeyWord);
            }).length>0
            );    
    
    
    // Event handler
    const onSelectFund = (val:string|number)=>{
        const fund = funds.find(it=>it.value === val);
        console.log('selected fund is ',fund);
        setState({activeFund:fund});
    }
    const onSelectAccount = (val:string|number)=>{
        const account = accountsInDisplay.find(it=>it.value===val);
        setState({activeAccount:account});
    }
    const onSearch:React.ChangeEventHandler<HTMLInputElement>=(param)=>{
        setState({searchKeyWord:param.target.value});
    }
    const onTreeNodesChecked = (param:{checked:Key[],halfChecked:Key[]}|Key[])=>{
        let checked:Key[]=[];
        if('checked' in param){
            checked=param.checked;
        }else{
            checked=param;
        }
        if(!checked?.length){
            setSelectedContacts([]);
            return;
        }
        const selectedNodes = _.flatten(contacts.map(it=>it.children))
            .filter(it=>it!=null&&checked.indexOf(it.key)>=0)
            .map(it=>(it as ITreeNode).data as IContact);
        setSelectedContacts(selectedNodes);
        //setContactKeys(param);
    }

    // Ref
    const treeDiv = React.useRef<HTMLDivElement>(null);
    const [treeHeight,setTreeHeight]=React.useState<number>(0);
    React.useEffect(()=>{
        setTreeHeight(treeDiv.current!.clientHeight);
    },[])

    

    

    return (
        <div className="wrapper">
            <div className="filter">
                <div className="item">
                    <Select options={funds} value={activeFund?.value} 
                    allowClear={true} placeholder='选择基金名称'
                    style={{width:'100%'}} onChange={onSelectFund}></Select>
                </div>
                <div className="item">
                    <Select options={accountsInDisplay} value={activeAccount?.value} 
                    allowClear={true} placeholder='选择投资公司名称'
                    style={{width:'100%'}} onChange={onSelectAccount}></Select>
                </div>
                <div className="item">
                    <Input value={searchKeyWord} onChange={onSearch}
                        allowClear={true} suffix={<SearchOutlined/>}
                        placeholder='通过关键字筛选'
                    ></Input>
                </div>
            </div>
            <div className="tree" ref={treeDiv}>
                <Tree treeData={contactsInDisplay} checkable={true} height={treeHeight}
                    itemHeight={52} onCheck={(param)=>onTreeNodesChecked(param)} selectable={false}
                    checkedKeys={contactKeys}                    
                >
                    
                </Tree>
            </div>
        </div>
    );
}

export {FundList};