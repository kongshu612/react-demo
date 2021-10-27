import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React from 'react';
import { EditDataNode, Tool } from './interface';

export interface LeafNodeProps{
    node:EditDataNode;
    nodeInEdit?:EditDataNode;
    disabled?:boolean;
    onEditNode:(node:EditDataNode)=>void;
    onCompleteEdit:(node:EditDataNode)=>void;
    onAddNode:(parentNode:EditDataNode)=>void;
    onDeleteNode:(node:EditDataNode)=>void;
}

const LeafNode:React.FC<LeafNodeProps>=({node,
    nodeInEdit,
    disabled:globalDisabled,
    onEditNode,
    onCompleteEdit,
    onAddNode,
    onDeleteNode,
})=>{
    const {title:label,inlineTools=[],disabled:nodeLevelDisabled}=node;
    const disabled = globalDisabled || nodeLevelDisabled;
    const editable = !disabled&&(!nodeInEdit||nodeInEdit===node);
    const isNodeInEdit = !disabled && (nodeInEdit===node);
    const isToolsVisible = editable&&!isNodeInEdit;
    const inputRef = React.useRef<Input>(null);
    
    React.useEffect(()=>{
        if(isNodeInEdit){
            inputRef.current?.focus();
        }
    },[isNodeInEdit]);

    const onEdit=()=>{
        if(!editable)return;
        onEditNode(node);
    }
    const onAdd=()=>{
        if(!editable)return;
        onAddNode(node);
    }
    const onDelete=()=>{
        if(!editable)return;
        onDeleteNode(node);
    }
    const internalTools:Tool[]= [
        {
            title:'add',
            getIcon:(node)=><PlusCircleOutlined/>,
            onClick:(node)=>onAdd(),
        },
        {
            title:'edit',
            getIcon:(node)=><EditOutlined/>,
            onClick:(node)=>onEdit(),
        },
        {
            title:'delete',
            getIcon:(node)=><DeleteOutlined/>,
            onClick:(node)=>onDelete(),
        }
    ];
    const [innerTitle,setInnerTitle]=React.useState<string>(label);
    React.useEffect(()=>{
        setInnerTitle(label);
    },[label]);
    const onChangeTitle:React.ChangeEventHandler<HTMLInputElement> =(e)=>{
        setInnerTitle(e.target.value);
    }
    const onSaveTitle=()=>{
        node.title=innerTitle;
        onCompleteEdit(node);
    }

    return (
        <div className='node-wrapper' onDoubleClick={()=>onEdit()}>
            {isNodeInEdit?<Input ref={inputRef}
                value={innerTitle} onChange={onChangeTitle} 
                onPressEnter={()=>onSaveTitle()}
                onBlur={()=>onSaveTitle()}/>:innerTitle}
            {isToolsVisible&&
                <span className='tool-wrapper'>
                    {inlineTools.concat(internalTools).map(({getIcon,title,onClick},index)=>(
                        <span className="tool" 
                            onClick={()=>onClick(node)}
                            title={title}
                            key={index}
                            >
                                {getIcon(node)}
                        </span>
                    ))}
                </span>
                }
        </div>
    );
}

export default LeafNode;