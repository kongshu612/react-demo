import React from 'react';
import { Route } from 'react-router-dom';
import BasicFlexForm from './basic';

const SubRoute:React.FC=()=>{
    return (
        <>
        <Route path='/flex-form/basic'><BasicFlexForm/></Route>
        </>
    )
}

export default SubRoute;