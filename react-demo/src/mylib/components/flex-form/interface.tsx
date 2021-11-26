import { ColProps } from "antd";
import { Rule } from "antd/lib/form";
import { FormListFieldData, FormListOperation } from "antd/lib/form/FormList";
import { NamePath } from "antd/lib/form/interface";
import { tuple } from "antd/lib/_util/type";
import React from "react";



const FieldTypes = tuple('textbox', 'inputnumber', 'switch', 'select', 'checkbox', 'radiobox','multiselect');
export type FieldType = typeof FieldTypes[number];

export interface FlexFieldProps {
    name: NamePath;
    label: string | React.ReactNode;
    fieldType?: FieldType;
    rules?: Rule[];
    options$?: Promise<({ label: string | React.ReactNode, value: any } | string)[]>;
    isGroup?: boolean;
    isList?: boolean;
    hidden?:boolean;
    readonly?:boolean;
    changeReadonly?:(readonly:boolean)=>void;
    editable?:boolean;
    wrapperCol?: ColProps;
    labelCol?: ColProps;
}

export type MetaConfig = Partial<FlexFieldProps> & { arrayChildren?: MetaConfig[][];[k: string]: any; }

export interface ConvertContext {
    keyname: string;
    value: any;
    metas?: MetaConfig[];
}

export interface InnerFlexFieldProps extends Pick<FlexFieldProps, 'fieldType' | 'options$'|'readonly'> {
    [k: string]: any;
}

export interface IFlexTreeNode {
    serializeName: string;
    children?: IFlexTreeNode[];
    data?: FlexFieldProps;
    name: NamePath;
}

export interface FieldArrayItem {
    fields: FormListFieldData[];
    operation: FormListOperation,
    meta: { errors: React.ReactNode[] };
    children: IFlexTreeNode[];
    readonly?:boolean;
}

export const ArrayIndexContext = React.createContext<NamePath>([]);

export interface FlexFieldContextType{
    readonly?:boolean;
    editable?:boolean;
    labelCol?:ColProps;
    wrapperCol?:ColProps;
}

export const FlexFieldContext = React.createContext<FlexFieldContextType>({});






