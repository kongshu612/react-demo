
import React from 'react';

type setValueFunc<T> = (val:(Partial<T>|((pre:T)=>T)))=>void;

export function useState<T=any>(initialValue:T):[val:T,setValue:setValueFunc<T>]{
    const [innerValue,setInnerValue]=React.useState(initialValue);
    const changeValue:setValueFunc<T> = (param)=>{
        if(typeof param === 'function'){
            setInnerValue(param);
        }else{
            setInnerValue(pre=>({...pre,...param}));
        }
    }
    return [innerValue,changeValue];
}