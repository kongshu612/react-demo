import React from 'react';
import {  FlexFieldContextType } from '../components/flex-form/interface';

export function useReadOnly({readonly=false,editable=false}:FlexFieldContextType)
:[boolean,(param:boolean)=>void]
{
    const [internalReadonly,setInternalReadonly]=React.useState(readonly);
    const editableRef=React.useRef(editable);
    editableRef.current=editable;

    React.useEffect(()=>{
        setInternalReadonly(readonly);
    },[readonly]);

    const changeReadonly=(target:boolean)=>{
        if(editableRef.current){
            setInternalReadonly(target);
        }
    }

    return [internalReadonly,changeReadonly];
}