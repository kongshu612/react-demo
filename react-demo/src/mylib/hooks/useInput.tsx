import React from 'react';

export function useInputChange<T>(value:T,callback:(pre:T,cur:T)=>void){
    const previous=React.useRef<T>(value);
    React.useEffect(()=>{
        callback(previous.current,value);
        previous.current=value;
    },[value]);
}