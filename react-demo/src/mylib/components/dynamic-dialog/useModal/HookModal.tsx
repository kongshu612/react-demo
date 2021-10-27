import { ConfigContext } from 'antd/lib/config-provider';
import React from 'react';
import { InternalDyanmicDialogProps } from '.';
import { DynamicDialog, DynamicDialogProps } from '../dynamic-dialog.component';

export interface DialogHookModelProps{
    afterClose:()=>void;
    config:InternalDyanmicDialogProps;
}

export interface DialogHookRef{
    destory:()=>void;
    update:(props:InternalDyanmicDialogProps)=>void;
}

const HookModal:React.ForwardRefRenderFunction<DialogHookRef,DialogHookModelProps>=({
    afterClose,
    config,
},ref)=>{
    const [visible,setVisible]=React.useState<boolean>(true);
    const [innerConfig,setInnerConfig]=React.useState<InternalDyanmicDialogProps>(config);
    const {getPrefixCls,direction}=React.useContext(ConfigContext);

    const prefixCls = getPrefixCls('dynamic-dialog');
    const rootPrefixCls=getPrefixCls();

    const close=(...args:any[])=>{
        setVisible(false);
        const triggerCancel = args.some(it=>it&&it.triggerCancel);
        if(innerConfig.onCancel&&triggerCancel){
            innerConfig.onCancel();
        }
    }

    React.useImperativeHandle(ref,()=>({
        destory:close,
        update:(newConfig:Partial<DynamicDialogProps>)=>setInnerConfig({...innerConfig,...newConfig})
    }));

    return (
        <DynamicDialog
            visible={visible}
            prefixCls={prefixCls}
            rootPrefixCls={rootPrefixCls}
            {...innerConfig}
            close={close}
            afterClose={afterClose}
        />
    )
}

export default React.forwardRef(HookModal);