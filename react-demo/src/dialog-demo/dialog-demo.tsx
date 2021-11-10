import { Button, Radio } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React from 'react';
import { MetaConfig } from '../mylib/components/flex-form/interface';
import FlexForm from '../mylib/components/flex-form/flex-form.component';
import { DialogService } from '../mylib/components/dynamic-dialog';


interface CloseDialog{
    close:()=>void;
    onSave:(val:any)=>void;
    initialValue:any;
    metas:MetaConfig[];
}

const defaultValue={
    name:'张三',
    age:23,
    gender:'female',
    email:'zhangsan@test.com'
}

const defaultvalue2={
    city:'Nanjing',
    visited:true,
}

const Dialog1:React.FC<CloseDialog>=({close,onSave,metas,initialValue})=>{    
    const [isValidate,setIsValidate]=React.useState<boolean>(false);
    const [form]=useForm();
    const checkFormValidate=()=>{
        const validate = form.getFieldsError().filter(it=>it.errors.length>0).length==0;
        if(validate!=isValidate){
            setIsValidate(validate);
        }
    }
    const onSubmit=()=>{
        const values = form.getFieldsValue();
        onSave(values);
    }
    const onClose=()=>{
        close();
    }
    React.useEffect(()=>{
        checkFormValidate();
    },[]);
    return(
        <div>
            <h2>这是一个动态Form，试试改变下面的值</h2>
            <FlexForm 
                form={form}
                initializeValue={initialValue} 
                metas={metas} 
                onChange={values => checkFormValidate()}>

            </FlexForm>
            <div>
                <Button htmlType='button' onClick={onClose}>Close</Button>
                <Button htmlType='button' onClick={onSubmit} disabled={!isValidate}>Submit</Button>
            </div>
        </div>
    )
}

interface FormDef{
    value:any,
    metas:MetaConfig[],
    label:string,
}


const FormsArray:FormDef[]=[
    {
        value:{
            name:'张三',
            age:23,
            gender:'female',
            email:'zhangsan@test.com'
        },
        metas:[
            {
                name:'gender',
                fieldType:'select',
                options$:Promise.resolve(['female','male','other'])
            },
            {
                name:'email',
                rules:[{type:'email'}]
            }
        ],
        label:'表单1'
    },
    {
        value:{
            city:'南京',
            visited:true,
        },
        metas:[
            {
                name:'city',
                fieldType:'select',
                options$:Promise.resolve(['北京','上海','广州','深圳','南京','苏州'])
            },
            {
                name:'visited',
                label:'是否去过',
            }
        ],
        label:'表单2'
    }
];
const modes:string[]=['居中弹框','附近弹框'];

const Demo1:React.FC=()=>{
    const [val,setVal]=React.useState<FormDef>(FormsArray[0]); 
    const [mode,setMode]=React.useState<string>('居中弹框');
    const {value,metas}=val;
    const openForm=(e:React.MouseEvent<HTMLElement>)=>{
        const onSave=(val:any)=>{
            setVal(pre=>{
                let item = {...pre,value:val};
                let index = FormsArray.findIndex(it=>it.label===item.label);
                FormsArray[index]=item;
                return item;
            });
            destory();
        }
        const onClose=()=>{
            destory();
        }
        const {destory} = DialogService.openComponent({
            content:<Dialog1 onSave={onSave} close={onClose} metas={metas} initialValue={value}/>,
            closable:true,
            dependedElement:mode==='附近弹框'?e.currentTarget:undefined,
        });
    }
    const onSelectForm=(form:FormDef)=>{
        setVal(form);
    }
    const onSelectMode=(mode:string)=>{
        setMode(mode);
    }
    return (
        <div className="each-example">
            <h2>演示函数调用的方式打开包含表单的弹框，表单则是由<b>动态表单</b>组件渲染</h2>
            <p>我们用同一个组件渲染不同的表单,表单的内容由数据驱动</p>
            <p>弹框可以居中弹框，也可以在某个Dom元素周围弹框</p>
            <p>表单序列化后的值{JSON.stringify(value)}</p>
            <div style={{margin:'100px 0 100px 100px'}}>
            <div style={{marginBottom:'20px'}}>
                    <label htmlFor="mode" style={{marginRight:'20px',fontWeight:600}}>选择弹框的位置</label>
                    <Radio.Group id='mode' value={mode}>
                        {modes.map(it=><Radio value={it} onClick={e=>onSelectMode(it)}>{it}</Radio>)}
                    </Radio.Group>
                </div>
                <div style={{marginBottom:'20px'}}>
                    <label htmlFor="formopt" style={{marginRight:'20px',fontWeight:600}}>选择要打开的表单</label>
                    <Radio.Group id='formopt' value={val}>
                        {FormsArray.map(it=><Radio value={it} onClick={e=>onSelectForm(it)}>{it.label}</Radio>)}
                    </Radio.Group>
                </div>
                <Button htmlType='button' onClick={openForm}>打开表单</Button>
            </div>
            <p>如下是代码调用示例,一行代码弹出你想弹的组件，没有额外的封装，适合于各种组件的组合</p>
            <p>{`const openForm=()=>{
        dialogRef.current = OpenComponent({
            content:<DiaglogContent/>,
        });

    }`}</p>
        </div> 
    )
}



const DialogDemo:React.FC =()=>{


    return (
        <>
        <Demo1/>
        </>
    )
}
export default DialogDemo