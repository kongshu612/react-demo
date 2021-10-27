import { ColProps, Form } from 'antd';
import { FormInstance, FormProps, useForm } from 'antd/lib/form/Form';
import React, { useImperativeHandle } from 'react';
import { FlexFieldContext, MetaConfig } from './interface';
import { convertToFlexFieldElements } from './utils/field-util';


export interface IFlexInput {
    [k: string]: string | number | boolean;
}

export interface IFlexFormProps<T = any> extends Omit<FormProps<T>,'onChange'|'metas'|'initializeValue'>{
    initializeValue: T;
    onChange?: (values: T) => void;
    metas?: MetaConfig[];
    readonly?:boolean;
    editable?:boolean;
    labelCol?:ColProps;
    wrapperCol?:ColProps;
}

const defaultLabelCol:ColProps={
    sm:{span:8},
    xs:{span:24},
}
const defaultItemCol:ColProps={
    sm:{span:16},
    xs:{span:24},
}

const FlexForm: React.ForwardRefRenderFunction<FormInstance<any>, IFlexFormProps> = (
    { 
        initializeValue, 
        onChange, 
        metas,
        readonly,
        editable,
        labelCol=defaultLabelCol,
        wrapperCol=defaultItemCol,
        form:originalForm,
        children,
        ...rest }, ref) => {
    const [form] = useForm(originalForm);
    useImperativeHandle(ref, () => {
        return form;
    });
    const fieldContextValue = React.useMemo(()=>({
        readonly,
        editable,
        labelCol,
        wrapperCol,
    }),[readonly,
        editable,
        labelCol,
        wrapperCol,]);
    return (
        <Form
            // fields={fieldsData}
            initialValues={initializeValue}
            form={form}
            onFieldsChange={(fields, allFields) => {
                onChange?.(form.getFieldsValue());
            }}            
            {...rest}
        >
                <FlexFieldContext.Provider value={fieldContextValue}
                >
                    {
                        React.useMemo(() => convertToFlexFieldElements(initializeValue, metas), [metas])
                    }
                </FlexFieldContext.Provider>
                {children}
        </Form>
    )
}



export default React.forwardRef(FlexForm);