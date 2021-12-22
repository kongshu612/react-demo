import React from 'react';
import { MetaConfig } from '../mylib/components/flex-form/interface';
import FlexForm from '../mylib/components/flex-form/flex-form.component';
import { Button, FormInstance } from 'antd';

interface UserTypeDemo {
    name: string;
    age: number;
    isBoy: boolean;
    [k: string]: any;
}
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
    }
}
const BasicDemo = () => {
    const metas: MetaConfig[] = [
        {
            name: 'name',
            label: '用户全名',
            rules: [{ required: true, }]
        },
        {
            name: 'age',
            label: '年纪',
            rules: [{ required: true }, { type: 'number', min: 0, max: 99 }],
            fieldType: 'inputnumber',
        },
        {
            name: 'gender',
            label: '性别',
            rules: [{ required: true }],
            fieldType: 'radiobox',
            options$: Promise.resolve([{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }, { label: 'Other', value: 'other' }]),
        },
        {
            name: 'favirateFoods',
            label: '喜欢的食物',
            fieldType: 'select',
            options$: Promise.resolve(['apple', 'pear', 'banana', 'peach', 'orange'].map(it => ({ label: it, value: it }))),
        },
        {
            name: 'agree',
            label: '是否同意',
        },
        {
            name: 'book',
            label: '喜欢的书籍',
            fieldType: 'select',
            options$: Promise.resolve(['book1', 'book2', 'book3']),
            rules: [{ required: true }],
            allowClear: true,
        }
    ];
    const [val, setVal] = React.useState<any>(
        { name: 'user1', age: 20, gender: 'male', favirateFoods: ['apple', 'pear'], agree: true }
    );
    return (
        <div className="each-example">
            <h2>基本用法，Form的结构由数据来驱动</h2>
            <p>表单的定义来自于数据+元数据的定义，这样表单就可以由外部的数据驱动产生</p>
            <span style={{lineHeight:'50px'}}>Serialize User is {JSON.stringify(val)}</span>
            <div style={{width:'40%'}}>
                <FlexForm initializeValue={val} 
                metas={metas} 
                onChange={values => setVal(values as UserTypeDemo)}></FlexForm>
            </div>            
        </div>
    )
}

const GroupDemo = () => {
    const metas: MetaConfig[] = [
        {
            name: 'fundName',
            label: '基金名称',
        },
        {
            name: 'accountDetail',
            label: '账号详情',
            isGroup: true,
        },
        {
            name: ['accountDetail', 'accountName'],
            label: '账号名称',
            rules: [{ required: true }, {
                validator: (ruleObj, val) => {
                    if (['account2', 'account3', 'account4'].includes(val)) {
                        return Promise.reject('name already exist');
                    } else {
                        return Promise.resolve('');
                    }
                }
            }]
        },
        {
            name: ['accountDetail', 'investorType'],
            label: '投资类型',
            fieldType: 'select',
            options$: Promise.resolve([{ label: 'Indivial', value: 12 }, { label: 'Entity', value: 1 }, { label: 'A Fund', value: 2 }]),
            rules: [{ required: true }]
        },
        {
            name: ['accountDetail', 'commitAmount'],
            label: '投资金额',
            rules: [{ type: 'number', min: 0 }],
        },
        {
            name: 'addressInfo',
            label: '地址详情',
            isGroup: true,
        },
        {
            name: ['addressInfo', 'country'],
            label: '国家',
            fieldType: 'select',
            options$: Promise.resolve(['China', 'US', 'UK']),
            rules: [{ required: true }]
        },
        {
            name: ['addressInfo', 'city'],
            label: '城市',
        },
        {
            name: ['contactDetail', 'primaryUser'],
            label: '主要联系人',
            fieldType: 'radiobox',
            options$: Promise.resolve(['user1', 'user2', 'user3', 'user4']),
        },
        {
            name: ['contactDetail', 'visitedCities'],
            label: '访问过的城市',
            fieldType: 'checkbox',
            options$: Promise.resolve(['Beijing', 'Nanjing', 'Shanghai', 'Hongkong', 'Guangzhou', 'Zhejiang'])
        }

    ]

    const [val, setVal] = React.useState<any>({
        fundName: 'fundName',
        accountDetail: {
            accountName: 'account1',
            investorType: 12,
            commitAmount: 100,
        },
        addressInfo: {
            country: 'China',
            city: 'Nanjing',
            isPrimaryAddress: true,
        },
        contactDetail: {
            primaryUser: 'user1',
            visitedCities: ['Beijing', 'Nanjing']
        }
    });

    return (
        <div className="each-example">
            <h2 style={{marginBottom:'10px'}}>这个用例是用来证明，Form的数据结构中存在着虚拟节点，这些节点会被自动过滤掉</h2>
            <p ><b>账号详情，地址详情，联系人信息</b>是三个分组，<b>联系人信息</b>因为没有配置标签，被自动过滤掉了，它的子节点<b>主要联系人，访问过的城市</b>被提高了一个层次</p>
            <span>Serialize Form is {JSON.stringify(val)}</span>
            <div style={{width:'60%'}}>
                <FlexForm 
                {...formItemLayout}
                initializeValue={val} 
                metas={metas} 
                onChange={values => setVal(values as UserTypeDemo)}></FlexForm>
            </div>
            
        </div>
    )
}

const BasicListDemo = () => {
    const [val, setVal] = React.useState<any>(
        {
            contacts: [
                {
                    email: 'user1.test@test.com',
                    isPrimary: true,
                    age: 12,
                },
                {
                    email: 'user2.test@test.com',
                    isPrimary: false,
                    age: 21,
                }
            ]
        }
    );
    const metas: MetaConfig[] = [
        {
            name: 'contacts',
            isList: true,
            label: '联系人列表',
            arrayChildren: [
                [
                    {
                        name: 'email',
                        label: '邮箱',
                        rules: [{ type: 'email' }]
                    },
                    {
                        name: 'isPrimary',
                        label: '是否主要联系人',
                        fieldType: 'switch',
                    },
                    {
                        name: 'age',
                        label: '年龄',
                        fieldType: 'inputnumber',
                        rules: [{ type: 'integer', min: 0, max: 99 }]
                    }

                ]

            ]
        }
    ];
    const formRef = React.useRef<FormInstance>(null);

    return (
        <div className="each-example">
            <h2>这个是用来演示对于数组类型的支持，</h2>
            <span>Serialize Form is {JSON.stringify(val)}</span><br/>
            <Button onClick={() => { console.log(formRef.current?.getFieldsValue()) }}>打印值到console</Button>
            <div style={{width:'60%'}}>
                <FlexForm 
                {...formItemLayout}
                initializeValue={val} ref={formRef}
                    metas={metas} onChange={(vals) => { setVal(vals); console.log(vals); }}></FlexForm>
            </div>
        </div>
    )
}

const BasicFlexForm:React.FC=()=>{
    return (
        <>
        <div style={{lineHeight:'30px',fontSize:'18px',height:'30px',fontWeight:600,margin:'20px 10px'}}>
            基于AntD Form 定义了一个FlexForm组件,我们只需给出Form的初始值，以及额外的元数据定义，那么，FlexForm会自动产生表单的定义。这样我们的表单完全由外部或者后端数据驱动</div>
        <div style={{height:'30px',marginTop:'50px',fontStyle:'italic',fontSize:'14px'}}>基本的用法可以简化成<b>&lt;FlexForm initializeValue=val metas=metas &gt;&lt;/FlexForm&gt;</b></div>
        <BasicDemo/>
        <GroupDemo/>
        <BasicListDemo/>
        </>
    )
}

export default BasicFlexForm;