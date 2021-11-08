import React from 'react';
import { Route } from 'react-router-dom';
import BasicFlexForm from './basic';
import EditableFlexForm from './edit-demo';

const SubRoute:React.FC=()=>{
    return (
        <>
        <Route path='/flex-form/basic'><BasicFlexForm/></Route>
        <Route path='/flex-form/editable'><EditableFlexForm/></Route>
        </>
    )
}

export default SubRoute;