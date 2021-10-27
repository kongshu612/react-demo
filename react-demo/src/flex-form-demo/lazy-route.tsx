import React from 'react';
import loadable from '@loadable/component';
import Loading from '../mylib/components/common/loading';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';

const FlexForm_Lazy= loadable(()=>import('./routing'),{fallback:<Loading/>});

export function getFlexFormRoute(){
    return (
        <Route path='/flex-form'><FlexForm_Lazy/></Route>
    )
};

export function getFlexFormRouting(){
    return (
        <ul>
            <li><Link to='/flex-form/basic'>基本功能的演示</Link></li>
        </ul>
        
    )
}