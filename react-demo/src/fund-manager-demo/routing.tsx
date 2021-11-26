import React from 'react';
import { Route } from 'react-router-dom';
import FundDemo from './fund-demo.component';



const FundDemoRoute:React.FC=()=>{
    return (
        <Route path='/fund-demo/dashboard'><FundDemo/></Route>
    );
}

export default FundDemoRoute