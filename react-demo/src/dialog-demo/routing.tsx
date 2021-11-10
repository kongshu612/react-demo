import React from 'react';
import { Route } from 'react-router';
import DialogDemo from './dialog-demo';

const DialogRoute:React.FC=()=>{
    return (
        <>
        <Route path='/dialog/basic'><DialogDemo/></Route>
        </>
    )
}

export default DialogRoute;