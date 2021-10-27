import React from 'react';
import {ConfigProvider, Modal} from 'antd';

import {ModalFuncProps} from 'antd/lib/modal/Modal';
import classNames from 'classnames';
import ActionButton from 'antd/lib/modal/ActionButton';
import { getTransitionName } from 'antd/lib/_util/motion';
import {AlignType, TargetType} from 'rc-align/lib/interface';
import Align from 'rc-align';

export interface DynamicDialogProps extends Omit<ModalFuncProps,'type'|'okCancel'|'close'>{
    footer?:React.ReactNode;
    hideFooter?:boolean;    
    rootPrefixCls?: string;
    close: (...args: any[]) => void;
    dependedElement?:HTMLElement;
    align?:AlignType;
}

const defaultAlignType:AlignType={
    points:['tl','bl'],
    offset:[0,5],
    overflow:{
        adjustX:true,
        adjustY:true,
    },
}

export const DynamicDialog:React.FC<DynamicDialogProps>=(props:DynamicDialogProps)=>{
    const {
        onCancel,
        onOk,
        zIndex,
        afterClose,
        visible,
        keyboard,
        centered:originalCentered,
        getContainer,
        maskStyle,
        okText='OK',
        okButtonProps,
        cancelText,
        cancelButtonProps,
        direction,
        prefixCls='ant',
        bodyStyle,
        closable = false,
        closeIcon,
        focusTriggerAfterClose,
        mask=true,
        width,
        style={},
        maskClosable=false,
        autoFocusButton=false,
        hideFooter=false,
        footer:originalFooter=null,
        rootPrefixCls='ant',
        close,
        title:originalTitle=null,
        dependedElement=null,
        align=defaultAlignType,
      } = props;
      const modalRender=React.useMemo(()=>{
        if(dependedElement===null){
            return undefined;
        }else{
            const targetType:TargetType=()=>{
                return dependedElement;
            }
            return (element:React.ReactNode)=>{
                return (
                    <Align
                        key='align'
                        target={targetType}
                        align={align}
                    >
                        {element as React.ReactElement}
                    </Align>
                )
            }
        }
      },[dependedElement,align]);

      const centered = !modalRender&&originalCentered;

      const contentPrefixCls=`${prefixCls}-dynamic-dialog`;
      const classString = classNames(
        contentPrefixCls,
        { [`${contentPrefixCls}-rtl`]: direction === 'rtl' },
        props.className,
      );
      

      

      let footer:React.ReactNode=originalFooter;
      if(!hideFooter){
        const okButton = (
            <ActionButton
                actionFn={onOk}
                closeModal={close}
                autoFocus={autoFocusButton==='ok'}
                buttonProps={okButtonProps}
                prefixCls={`${rootPrefixCls}-btn`}
            >
                {okText}
            </ActionButton>
        )
        const cancelButton = !!cancelText&&(typeof cancelText!='string'||cancelText.length>0)?(
            <ActionButton
                actionFn={onCancel}
                closeModal={close}
                autoFocus={autoFocusButton==='cancel'}
                buttonProps={cancelButtonProps}
                prefixCls={`${rootPrefixCls}-btn`}
            >
                {cancelText}
            </ActionButton>
        ):null;
        footer=(
            <div className={`${contentPrefixCls}-btns`}>
                {cancelButton}
                {okButton}
            </div>
        );
      }else{
          footer=null;
      }
      let header=originalTitle;
      if(!!originalTitle&&typeof originalTitle==='string'&&!originalTitle.length){
          header=null;
      }
      if(!!header){
          header = (
            <span className={`${contentPrefixCls}-title`}>{header}</span>
          )
      }
    



    return (
        <Modal
            title=''
            footer=''
            className={classString}
            wrapClassName={classNames({[`${contentPrefixCls}-centered`]:!!centered})}
            onCancel={()=>close({triggerCancel:true})}
            visible={visible}            
            transitionName=''
            maskTransitionName={getTransitionName(rootPrefixCls, 'fade', props.maskTransitionName)}
            mask={mask}
            maskClosable={maskClosable}
            maskStyle={maskStyle}
            style={style}
            width={width}
            zIndex={zIndex}
            afterClose={afterClose}
            keyboard={keyboard}
            centered={centered}
            getContainer={getContainer}
            closable={closable}
            closeIcon={closeIcon}
            modalRender={modalRender}
            focusTriggerAfterClose={focusTriggerAfterClose}
        >
            <div className={`${contentPrefixCls}-body-wrapper`}>
                <ConfigProvider prefixCls={rootPrefixCls}>
                    <div className={`${contentPrefixCls}-body`} style={bodyStyle}>
                        {header}
                        <div className={`${contentPrefixCls}-content`}>{props.content}</div>
                    </div>
                </ConfigProvider>
                {footer}
            </div>
        </Modal>
    )
}


