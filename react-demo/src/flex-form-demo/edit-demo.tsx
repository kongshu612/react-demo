import { FormInstance, Radio } from 'antd';
import React from 'react';
import {useState} from '../mylib/hooks/useState';
import { MetaConfig } from '../mylib/components/flex-form/interface';
import FlexForm from '../mylib/components/flex-form/flex-form.component';

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


const DynamicFieldDemo=()=>{
    const user={
        name:'user1',
        food:'apple',
    };
    const [metas,setMetas]=useState<MetaConfig[]>([
        {
            name:'name',
            label:'全名',
            rules:[{required:true}]
        },
        {
            name:'food',
            label:'喜欢的水果',
            fieldType:'radiobox',
            options$:Promise.resolve(['apple','pear','other']),
        },
        {
            name:'detail',
            label:'喜欢的水果详情',
            fieldType:'textbox',
            hidden:true
        }
    ]);
    const formRef = React.useRef<FormInstance>(null);
    const [val,setVal]=useState<any>(user);
    const onFormValueChange=(values:any)=>{
        const shouldhidden = values?.['food']!=='other';
        setMetas((pre)=>{
            let node = pre.find(it=>it.name==='detail');
            if(node?.hidden!==shouldhidden){
                node!.hidden=shouldhidden;
                return [...pre];
            }else{
                return pre;
            }                
        });
        setVal(values);
    }

    return (
        <div className="each-example">
            <h2>这个用例展示，表单中的某些字段依赖其他字段的值来显示或者隐藏</h2>
            <p>当<b>喜欢的水果</b>字段选择其他时，第三个<b>详情字段</b>会出现</p>
            <span>Serialize Form is {JSON.stringify(val)}</span>
            <div style={{width:'50%'}}>
            <FlexForm 
                {...formItemLayout}
                initializeValue={user} 
                ref={formRef}
                metas={metas} 
                onChange={onFormValueChange}></FlexForm>
            </div>
            
        </div>
    );
}

interface EditableState{
    readonly:boolean;
    editable:boolean;
}

const EditableFieldDemo=()=>{
    const user={
        name:'user1',
        age:24,
        gender:'female',
        addresses:[{city:'Nanjing',street:'TaiPingNanRoad'},{city:'ShangHai',street:'PuDong'}]
    };
    const metas:MetaConfig[]=[
        {
            name:'gender',
            label:'Gender',
            fieldType:'radiobox',
            options$:Promise.resolve(['female','male','other']),
        },
        {
            name:'addresses',
            isList:true,
            label:'Contact Addresses:',
            arrayChildren:[
                [
                    {
                        name:'city',
                        label:'City',
                        fieldType:'select',
                        options$:Promise.resolve(['ShangHai','Nanjing','Hangzhou','Beijing'])
                    }
                ]
            ]
        }
    ];

    const [val,setVal]=React.useState(user);
    const [edit,setEdit]=useState<EditableState>({readonly:false,editable:false});
    const {readonly,editable}=edit;
    console.log(edit);

    return (
        <div className="each-example">
            <h2>这个用例展现表单在非编辑模式与编辑模式的切换</h2>
            <p><b>表单的编辑模式</b>指，表单可以让所有的字段处于只读模式，只提供字段级别的编辑功能</p>
            <p>在字段层级上，当表单的编辑功能打开后，字段会相应的出现编辑按钮</p>
            <div>
                <label htmlFor="editable">是否打开表单可编辑功能</label>
                <Radio.Group id='editable' value={editable} 
                    onChange={param=>setEdit({editable:param.target.value})}>
                    <Radio value={false}>不打开</Radio>
                    <Radio value={true}>打开</Radio>
                </Radio.Group>
            </div>
            <div>
                <label htmlFor="readonly">设置所有的字段的状态，编辑模式还是只读模式</label>
                <Radio.Group value={readonly} onChange={param=>setEdit({readonly:param.target.value})}>
                    <Radio value={true}>只读模式</Radio>
                    <Radio value={false}>编辑模式</Radio>
                </Radio.Group>
            </div>
            <div>
                <span>{JSON.stringify(val)}</span>
            </div>
            <div style={{width:'50%'}}>
            <FlexForm
                initializeValue={user}
                metas={metas}
                onChange={values=>setVal(values)}
                {...edit}
            ></FlexForm>
            </div>
            
            
        </div>
    )

}

const EditableFlexForm:React.FC=()=>{
    return (
        <>
        <DynamicFieldDemo/>
        <EditableFieldDemo/>
        </>
    );
}

export default EditableFlexForm;