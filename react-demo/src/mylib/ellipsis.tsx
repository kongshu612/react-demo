import React, {  ReactElement, ReactText } from 'react';
import classNames from 'classnames';
import './style.scss';
//import Tooltip, {TooltipProps} from '../components/tooltip';

import  {Tooltip,TooltipProps} from 'antd';

export interface EllipsisProps{
    rows?:number;
    action?:'click'|'hover';
    tooltip?:React.ReactNode|(()=>React.ReactNode);
    className?:string;
    style?:React.CSSProperties;
    placement?:TooltipProps['placement'];
}



const Ellipsis:React.FC<EllipsisProps>=({
    rows=1,
    action='hover',
    tooltip=undefined,
    className=undefined,
    children,
    style:customizedStyle={},
    placement='bottomRight',
})=>{
    const ref = React.useRef<HTMLSpanElement>(null);
    const tooltipElementRef = React.useRef<HTMLSpanElement>(null);

    const mergedTooltip = tooltip??(
        typeof children === 'string'||typeof children === 'number'?
        (children as ReactText) :
        React.cloneElement(children as ReactElement)
    );
    
    // ahchor element

    const actionRef = React.useRef<'hover'|'click'>(action);
    if(actionRef.current!==action){
        actionRef.current=action;
    }
    const anchorElement = (
        <Tooltip
            overlay={mergedTooltip}
            trigger={action}
            placement={placement}
        >
            <span ref={tooltipElementRef}
                    className='ellipsis-anchor'
                    style={{
                        position:'absolute',
                        right:'5px',
                        bottom:0,
                        minWidth:'1.5em',
                        height:'1.1em',
                        opacity:0,
                    }}
                    ></span>
        </Tooltip>);

    const mergedStyle:React.CSSProperties = React.useMemo(()=>{
        if(rows===1){
            const style:React.CSSProperties={
                textOverflow:'ellipsis',
                whiteSpace:'nowrap',
                overflow:'hidden',
                display:'inline-block',
                maxWidth:'100%',
                position:'relative',
            }
            return {
                ...customizedStyle,
                ...style
            };
        }else{
            const style:React.CSSProperties={
                display:'-webkit-box',
                WebkitLineClamp:rows,
                WebkitBoxOrient:'vertical',
                overflow:'hidden',
                maxWidth:'100%',
                position:'relative',
            }
            return {
                ...customizedStyle,
                ...style
            };
        }       
    },[rows,customizedStyle]);

    const mergedClassName = classNames(
        'ellipsis-wrap',
        {
            ['single-line']:rows===1,
            ['multi-line']:rows>1,
        },
        `${className}`
    );

    React.useLayoutEffect(()=>{
        if(ref.current==null){
            return;
        }
        const offsetHeight = ref.current.offsetHeight;
        const scrollHeight = ref.current.scrollHeight;
        const offsetWidth = ref.current.offsetWidth;
        const scrollWidth = ref.current.scrollWidth;
        if(scrollHeight - offsetHeight >=8 || (rows===1 && scrollWidth>=offsetWidth)){
            (tooltipElementRef.current!).style.display='unset';
        }else{
            (tooltipElementRef.current!).style.display='none';
        }
    })

    return (
        <span style={mergedStyle}
            className={mergedClassName}
            ref={ref}
        >
            {children}
            {anchorElement}
        </span>
    )
}

Ellipsis.displayName='Ellipsis';

export default Ellipsis;