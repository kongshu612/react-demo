import React from 'react';

export function useIf(condition:boolean,callback:()=>any){
    return condition?callback():null;
}