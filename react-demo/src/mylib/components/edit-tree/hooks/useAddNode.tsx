import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {Modal} from 'antd'
import { Key } from 'rc-tree-select/lib/interface';
import React from 'react';
import { EditDataNode, Tool } from '../interface';
import { finditemArray, travelTreeByLevel } from '../util/treehelp';

let i=0;
export function useAddNode(nodes:EditDataNode[],
    expandKeys:Key[]=[],
    disabled?:boolean,
    onNodeAdd?:(node:EditDataNode,nodes:EditDataNode[])=>void,
    onNodeDelete?:(node:EditDataNode,nodes:EditDataNode[])=>void,
    onNodeSaved?:(node:EditDataNode,nodes:EditDataNode[])=>void,
    ):
[EditDataNode|undefined,
    EditDataNode[],
    Key[],
    (parent?:EditDataNode)=>void,
    (node:EditDataNode)=>void,
    (node:EditDataNode)=>void,
    (node:EditDataNode)=>void,
    ()=>void,
    React.Dispatch<React.SetStateAction<Key[]>>,
]
{
    const [nodeInEdit,setNodeInEdit]=React.useState<EditDataNode>();
    const [nodeInAdd,setNodeInAdd]=React.useState<EditDataNode>();
    const [originalTitle,setOriginalTitle]=React.useState<string>(); 
    const [,update]=React.useState<number>();
    const [treeDataMerge,setTreeDataMerge]=React.useState<EditDataNode[]>(nodes);
    const [expandedKeys,setExpandedKeys]=React.useState<Key[]>(expandKeys)

    const refreshTreeData=()=>{
        setTreeDataMerge([...nodes]);
    }

    const addNode=(parent?:EditDataNode)=>{
        if(!!nodeInEdit||disabled)return null;

        let key='';
        if(!!parent){
            key = `${parent.key}-${parent.children?.length||0}`;
        }else{
            key=`${nodes.length}`;
        }
        const inserted:EditDataNode={
            key:key,
            title:'',
        }

        if(!!parent){
            parent.children=[...parent.children||[],inserted];
            setExpandedKeys(pre=>[...pre||[],parent.key]);
        }else{
            nodes.push(inserted);
        }
        setNodeInEdit(inserted);
        setNodeInAdd(inserted);
        setOriginalTitle('');
        refreshTreeData();
        onNodeAdd?.(inserted,nodes);
        return inserted;
    }
    const markNodeInEdit=(node:EditDataNode)=>{
        if(!nodeInEdit){
            setNodeInEdit(node);
            setOriginalTitle(node.title);
        }
    };
    const completeNodeInEdit = (node:EditDataNode)=>{
        if(node===nodeInEdit){
            // Node Name is not error
            if(!isNodeNameLegal(node)){
                // remove the added item and popup error message
                if(node === nodeInAdd){
                    const parentArray = finditemArray(nodes,node);
                    if(parentArray&&parentArray.length>0){
                        const index = parentArray.indexOf(node);
                        parentArray.splice(index,1);
                        refreshTreeData();
                        Modal.error({
                            title:'Error',
                            content:'Name is illegal',
                        })
                    }
                }else{
                    setTimeout(()=>{
                        // reset title to original one for edit
                        node.title=originalTitle!;
                        forceUpdate();
                        Modal.error({
                            title:'Error',
                            content:'Name is illegal',
                        })
                    })

                }
            }
            setNodeInEdit(undefined);
            setNodeInAdd(undefined);
            setOriginalTitle(undefined);
            onNodeSaved?.(node,nodes);
        }
    }
    const deleteNode = (node:EditDataNode)=>{
        const parentArray = finditemArray(nodes,node);
        if(parentArray&&parentArray.length>0){
            Modal.confirm({
                title:'Warning',
                content:'Are you sure to delete?',
                onOk:()=>{
                    const index = parentArray.indexOf(node);
                    parentArray.splice(index,1);
                    refreshTreeData();
                    onNodeDelete?.(node,nodes);
                },
                cancelText:'No',
                okText:'Yes',
            })
            
        }
    }
    const isNodeNameLegal=(node:EditDataNode)=>{
        if(!node.title.length)return false;
        const allNames:string[]=[];
        travelTreeByLevel(nodes,(it)=>{
            if(it===node)return;
            allNames.push(it.title);
        });
        return !~allNames.indexOf(node.title);
    }

    const forceUpdate = ()=>{
        update(i++);
    }



    return [nodeInEdit,treeDataMerge,expandedKeys,addNode,
        markNodeInEdit,completeNodeInEdit,deleteNode,
        forceUpdate,setExpandedKeys,];
}