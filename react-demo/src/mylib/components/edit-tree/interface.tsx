import { TreeProps,DataNode } from 'antd/lib/tree';

export interface EditTreeProps extends Omit<TreeProps,
    'showLine'|
    'multiple'|
    'autoExpandParent'|
    'checkable'|
    'defaultExpandAll'|
    'defaultExpandParent'|
    'draggable'|
    'treeData'|
    'draggable'|
    'key'
    >{
    treeData:EditDataNode[];
    onNodeAdd?:(node:EditDataNode,nodes:EditDataNode[])=>void;
    onNodeDelete?:(node:EditDataNode,nodes:EditDataNode[])=>void;
    onNodeSaved?:(node:EditDataNode,nodes:EditDataNode[])=>void; 
    disabled?:boolean;    
}

export interface EditDataNode extends Omit<DataNode,'title'> {
    data?:any;
    disabled?:boolean;
    children?:EditDataNode[];  
    inlineTools?:Tool[];
    title:string;
}

export interface Tool{
    title?:string;
    onClick:(treeNode:EditDataNode)=>void;
    getIcon:(treeNode:EditDataNode)=>React.ReactNode;
}

export interface EditTreeRef{
    insertAfter:(label:string)=>void;
}

