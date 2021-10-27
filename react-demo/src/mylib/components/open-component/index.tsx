import Portal, {PortalWrapperProps} from 'rc-util/lib/PortalWrapper';
import React from 'react';
import _ from 'lodash';


const MyPortal:React.FC<PortalWrapperProps>=(props)=>{
    const {visible,forceRender,children}=props;
    if(!visible){
        return null;
    }

    return (
        <Portal visible forceRender={forceRender}>
            {
                (childPrpos)=>children(childPrpos)
            }
        </Portal>
    );
}

export default MyPortal;




