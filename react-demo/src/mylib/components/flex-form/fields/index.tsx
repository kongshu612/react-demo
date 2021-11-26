import React, { Children } from 'react';
import { Form, Input, Radio, Select, Switch, Checkbox, Button, InputNumber } from 'antd';
import { InnerFlexFieldProps, FieldType, FlexFieldProps, IFlexTreeNode, FieldArrayItem, ArrayIndexContext, FlexFieldContext } from '../interface';
import _ from 'lodash';
import { NamePath } from 'antd/lib/form/interface';
import { serializesName } from '../utils/field-util';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { toArray } from 'rc-field-form/lib/utils/typeUtil';
import './fields.scss';
import { useReadOnly } from '../../../hooks/useReadOnly';
//import Checkbox from '../../../../components/checkbox';
const { Item, List } = Form;

const FlexField: React.FC<InnerFlexFieldProps> = ({ 
    fieldType, 
    children, 
    options$,
    editable,
    readonly,
    changeReadonly,
    ...rest }) => {
    const [options, setOptions] = React.useState<{ label: string | React.ReactNode, value: any }[]>([]);
    React.useEffect(() => {
        options$?.then(opts => {
            opts = opts.map(it => typeof it === 'string' ? ({ label: it, value: it }) : it)
            setOptions(opts as any);
        });
    }, [options$]);
    // 注意这边的...rest,之前有个bug, 没加这个，结果，它跟form 关联不上，因为这里面有onChange,value....等一堆东西.
    const getToolbar=()=>{
        if(!editable){
            return null;
        }
        if(readonly){
            return <Button icon={<EditOutlined/>} onClick={()=>changeReadonly(false)}></Button>
        }else{
            return <Button icon={<SaveOutlined/>} onClick={()=>changeReadonly(true)}></Button>
        }
    }
    return (
        <>
            <div style={{position:'relative',paddingRight:'50px',}}>
                {fieldType === 'textbox' ? <Input {...rest} readOnly={readonly} /> : null}
                {fieldType === 'switch' ? <Switch {...rest} disabled={readonly} /> : null}
                {fieldType === 'inputnumber' ? <InputNumber {...rest} readOnly={readonly} /> : null}
                {fieldType === 'select' ? <Select options={options} {...rest} disabled={readonly}></Select> : null}
                {fieldType === 'multiselect'?<Select options={options} mode='multiple' disabled={readonly} {...rest}></Select>:null}
                {
                    fieldType === 'radiobox' ?
                        <Radio.Group options={options} {...rest} disabled={readonly}>
                        </Radio.Group> : null
                }
                {
                    fieldType === 'checkbox' ?
                        <Checkbox.Group options={options} {...rest} disabled={readonly}></Checkbox.Group> : null
                }
                <span style={{position:'absolute',right:'10px'}}>
                    {getToolbar()}
                </span>
                
            </div>  
        </>
    )
}
function getValuePropName(fieldType: FieldType | undefined) {
    switch (fieldType) {
        case 'switch': return 'checked';
        default: return 'value';
    }

}

const FlexFieldItem: React.FC<FlexFieldProps> = ({ 
    name: originalName, 
    label,
    hidden, 
    fieldType, 
    rules, 
    wrapperCol,
    labelCol,
    
    ...restProps }) => {
    const arrayIndexContext = React.useContext(ArrayIndexContext);
    let name = [...toArray(arrayIndexContext), ...toArray(originalName)];
    
    return !hidden?(
        <Item
            name={name}
            label={label}
            valuePropName={getValuePropName(fieldType)}
            rules={rules}
            wrapperCol={wrapperCol}
            labelCol={labelCol}
        >
            <FlexField fieldType={fieldType} {...restProps} />
        </Item>
    ):null;
}

const FlexFieldArrayWrapper: React.FC<FieldArrayItem> = ({ fields, operation, children,readonly }) => {
    const { remove } = operation;
    return (
        <>
            {
                fields.map((field, index) => {
                    let child = { ...(children![0] as IFlexTreeNode), ...((children![index] || {}) as IFlexTreeNode) };
                    let name: NamePath = [field.name];
                    let serializeName = serializesName(index);
                    let data = { ...child.data, name } as FlexFieldProps;
                    child = { ...child, name, serializeName, data }
                    return (
                        <Item key={field.key} noStyle>
                            <div className='flex-array-item'>
                                {
                                    readonly?null:<Button className='array-btn' 
                                    icon={<DeleteOutlined />} 
                                    onClick={() => remove(index)}></Button>
                                }                                
                                <ArrayIndexContext.Provider value={name}>
                                    <FlexFieldItemWrapper  {...child} />
                                </ArrayIndexContext.Provider>                            
                            </div>                            
                        </Item>
                    );
                })
            }
        </>
    )

}

const FlexFieldItemWrapper: React.FC<IFlexTreeNode> = ({ data, children, name, serializeName }) => {
    const fieldContext=React.useContext(FlexFieldContext);
    const [readonly,setReadonly]=useReadOnly(fieldContext);
    const {editable,labelCol,wrapperCol}=fieldContext;
    const hasNoLabel = data?.label===undefined||data?.label===null||data?.label==='';
    const mergedLabelCol = hasNoLabel?undefined:(data?.labelCol||labelCol);
    if (data?.isGroup) {
        return (
            <Item
                {..._.omit(data, ['name', 'isGroup','fieldType'])}
                className='flex-group'
                noStyle={hasNoLabel}
                labelCol={mergedLabelCol}
            >
                {
                    children?.map(it => (
                        <FlexFieldItemWrapper key={it.serializeName} {...it} />
                    ))
                }
            </Item>
        );
    } else if (data?.isList) {
        return (
            <List name={name}>
                {
                    (fields, operation, meta) => {
                        return (
                            <>
                                <Item 
                                label={data?.label}
                                noStyle={hasNoLabel}
                                labelCol={mergedLabelCol}
                                >
                                    <FlexFieldArrayWrapper 
                                        fields={fields}
                                        operation={operation}
                                        meta={meta}
                                        children={children as any}
                                        readonly={readonly}
                                        ></FlexFieldArrayWrapper>
                                    {
                                        readonly?null:
                                            <Item>
                                                <Button icon={<PlusCircleOutlined />} onClick={() => operation.add()}>Add</Button>
                                            </Item>
                                    }                                     
                                </Item>
                                
                            </>
                        )
                    }
                }
            </List>
        )
    }
    else {
        return <FlexFieldItem 
            {..._.omit(data, ['isGroup', 'isList'])} 
            readonly={readonly} 
            changeReadonly={setReadonly}
            editable={editable}
            labelCol={mergedLabelCol}
            wrapperCol={wrapperCol}
            ></FlexFieldItem>;
    }
}

export default FlexFieldItemWrapper;