
import React from 'react';

type setValueFunc<T> = (val:(T|Partial<T>|((pre:T)=>T)))=>void;

export function useState<T=any>(initialValue:T):[val:T,setValue:setValueFunc<T>]{
    const [innerValue,setInnerValue]=React.useState(initialValue);
    const changeValue:setValueFunc<T> = (param)=>{
        if(typeof param === 'function'){
            setInnerValue(param);
        }else if(Array.isArray(param)){
            setInnerValue(pre=>param as T);
        }else if(typeof param === 'object'){
            setInnerValue(pre=>({...pre,...param}));
        }
        else{
            setInnerValue(pre=>param as T);
        }
    }
    return [innerValue,changeValue];
}