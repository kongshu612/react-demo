import React from 'react';
import {Link, Route, Router} from 'react-router-dom';
import loadable from '@loadable/component';
import Loading from '../mylib/components/common/loading';

const FundLazyLoad=loadable(()=>import('./routing'),{fallback:<Loading/>});

export const getFundRoute=()=>{
    return (
        <Route path='/fund-demo'><FundLazyLoad/></Route>
    );
}

export const getfundRouting=()=>{
    return (
        <ul>
            <li><Link to='/fund-demo/dashboard'>基金管理页面</Link></li>
        </ul>
    );
}

