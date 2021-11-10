import React from 'react';
import usePatchElement from 'antd/lib/_util/hooks/usePatchElement';
import { DynamicDialog, DynamicDialogProps } from '../dynamic-dialog.component';
import DynamicHookModal, { DialogHookRef } from './HookModal';
import ReactDOM from 'react-dom';

let uuid=0;
interface ElementsHolderRef{
    patchElement:ReturnType<typeof usePatchElement>[1];
}

export interface InternalDyanmicDialogProps extends Omit<DynamicDialogProps,'close'>{
}

const destoryFns:Array<()=>void>=[];

export function destoryAll(){
    while(destoryFns.length){
        const it = destoryFns.pop();
        it?.();
    }
}

export interface OpenHookFunc{
    openDynamicDialog:(props:InternalDyanmicDialogProps)=>DialogHookRef
}



const ElementsHolder = React.memo(
    React.forwardRef<ElementsHolderRef>((props,ref)=>{
        const [elements,patchElement]=usePatchElement();
        React.useImperativeHandle(ref,()=>({patchElement}));
        return <>{elements}</>;
    })
);

export function useDynamicDialog():[OpenHookFunc,React.ReactElement]{
    const holderRef = React.useRef<ElementsHolderRef>(null as any);
    const [actionQueue,setActionQueue]=React.useState<(()=>void)[]>([]);
    React.useEffect(()=>{
        if(actionQueue.length>0){
            actionQueue.forEach(it=>it());
            setActionQueue([]);
        }
        
    },[actionQueue])

    const openDialogHook = React.useCallback((props:InternalDyanmicDialogProps)=>{
        const {hideFooter:originalHideFooter,footer,okText,cancelText,onOk,onCancel,centered=true}=props;
        const mergedhideFooter = originalHideFooter||
            (!footer&&!okText&&!cancelText&&!onOk&&!onCancel);
        props={centered,...props,hideFooter:mergedhideFooter,};
        uuid++;
        const dynamicHookRef = React.createRef<DialogHookRef>();
        const closeHook=()=>{
            destory?.();
        }
        const hookModal = (
            <DynamicHookModal
                key={uuid}
                config={props}
                afterClose={closeHook}
                ref={dynamicHookRef}
            />);
        const destory = holderRef.current?.patchElement(hookModal);

        return {
            destory:()=>{
                const destoryAction=()=>{
                    dynamicHookRef.current?.destory();
                }
                if(dynamicHookRef.current){
                    destoryAction();
                }else{
                    setActionQueue(pre=>[...pre,destoryAction]);
                }
            },
            update:(newProps:InternalDyanmicDialogProps)=>{
                const updateAction=()=>{
                    dynamicHookRef.current?.update(newProps);
                }
                if(dynamicHookRef.current){
                    updateAction();
                }else{
                    setActionQueue(pre=>[...pre,updateAction]);
                }
            }
        };
    },[]);
    const openDialog = React.useMemo(()=>({
        openDynamicDialog:openDialogHook
    }),[]);

    return [openDialog,<ElementsHolder ref={holderRef}/>];
}

export function openDynamicDialog(props:InternalDyanmicDialogProps):DialogHookRef{
    const div = document.createElement('div');
    document.body.append(div);
    let currentConfig={...props,visible:true,close};
    

    function destory(...args:any[]){
        const unmountResult = ReactDOM.unmountComponentAtNode(div);
        if(unmountResult && div.parentNode){
            div.parentNode.removeChild(div);
        }
        const triggerCancel = args.some(it=>it && it.triggerCancel);
        if(props.onCancel&&triggerCancel){
            props.onCancel(...args);
        }
        let index = destoryFns.findIndex(it=>it===close);
        destoryFns.splice(index,1);
    }

    function render(props:DynamicDialogProps){
        setTimeout(()=>{
            ReactDOM.render(
                <DynamicDialog
                    {...props}
                />,
                div
            )
        })
    }

    function close(...args:any[]){
        currentConfig={...currentConfig,
            visible:false,
            afterClose:()=>{
                if(typeof props.afterClose==='function'){
                    props.afterClose();
                }
                destory();
            }
        }
        render(currentConfig);
    }

    function update(propsUpdate:InternalDyanmicDialogProps|((pre:InternalDyanmicDialogProps)=>InternalDyanmicDialogProps)){
        if(typeof propsUpdate ==='function'){
            currentConfig=propsUpdate(currentConfig) as any;
        }else{
            currentConfig={...currentConfig,...propsUpdate};
        }
        render({...currentConfig,close});
    }

    render(currentConfig);
    destoryFns.push(close);

    return {
        destory:close,
        update,
    }
}


 





