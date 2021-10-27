import React from 'react';
import { EditDataNode, EditTreeProps, EditTreeRef,  Tool } from './interface';
import {Button, Tree} from 'antd';
import './style.scss';
import { DataNode, EventDataNode, Key } from 'rc-tree/lib/interface';
import { useAddNode } from './hooks/useAddNode';
import LeafNode from './leaf-tree.component';
import { DownOutlined, PlusCircleFilled, PlusOutlined, PlusSquareFilled, PlusSquareOutlined } from '@ant-design/icons';




const InnerEditTree:React.ForwardRefRenderFunction<EditTreeRef,EditTreeProps>=({
    treeData,
    disabled=false,  
    expandedKeys,
    onNodeAdd,
    onNodeDelete,
    onNodeSaved,
    ...restProps
},ref)=>{  
    
    const [
        nodeInEdit,
        treeDataMerge,
        expandedKeysInternal,
        addNode,
        markNodeInEdit,
        completeNodeInEdit,
        deleteNode,
        forceUpdate,
        setExpandedKeys,
    ]=useAddNode(treeData,expandedKeys,disabled,);  
    const isAddNewDisable = nodeInEdit!==undefined || disabled;  
    
    
    const leafNode = (node:DataNode)=>{        
        return (
        <LeafNode node={node as EditDataNode} 
            disabled={disabled} 
            nodeInEdit={nodeInEdit}
            onEditNode={markNodeInEdit}
            onCompleteEdit={completeNodeInEdit}
            onAddNode={addNode}
            onDeleteNode={deleteNode}
            />
        );        
    };

    const onExpandInternal = (expandedKeys: Key[],
        info: {
          node: EventDataNode;
          expanded: boolean;
          nativeEvent: MouseEvent;
        })=>{
            setExpandedKeys(expandedKeys);
        }
    const onAddNode=()=>{
        addNode();
    }

    return (
        <div style={{width:'500px'}}>
            <div style={{textAlign:'right'}}>
                <Button icon={<PlusOutlined/>} onClick={onAddNode} disabled={isAddNewDisable}
                type='text'></Button>
            </div>
            <Tree
                {...restProps}
                treeData={treeDataMerge}
                titleRender={leafNode}
                selectable={!disabled}
                onExpand={onExpandInternal}
                expandedKeys={expandedKeysInternal}
                className='edit-tree'
                switcherIcon={<DownOutlined/>}
                virtual={true}
                itemHeight={32}
                height={500}
            />
        </div>
    )
}

const EditTree = React.forwardRef(InnerEditTree);
EditTree.displayName='EditTree';


export default EditTree;
