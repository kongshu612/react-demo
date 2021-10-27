
import { DynamicDialogProps } from './dynamic-dialog.component';
import { openDynamicDialog } from './useModal';
import { DialogHookRef } from './useModal/HookModal';
import {useDynamicDialog} from './useModal';

export interface IOpenPanelProps extends Pick<DynamicDialogProps,
    'content'|
    'title'|
    'footer'|
    'hideFooter'|
    'closable'|
    'okText'|
    'cancelText'|
    'onOk'|
    'onCancel'|
    'maskClosable'|
    'centered'|
    'dependedElement'|
    'align'|
    'afterClose'
    >{

}

function OpenComponent(props:IOpenPanelProps):DialogHookRef{
    const {hideFooter:originalHideFooter,footer,okText,cancelText,onOk,onCancel,centered=true}=props;
    const mergedhideFooter = originalHideFooter||
        (!footer&&!okText&&!cancelText&&!onOk&&!onCancel);
    return openDynamicDialog({centered,...props,hideFooter:mergedhideFooter});
}

export  const DialogService={
    useDynamicDialog,
    openComponent:OpenComponent
}

