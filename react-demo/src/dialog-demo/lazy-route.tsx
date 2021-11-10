import loadable from "@loadable/component";
import { Link, Route } from "react-router-dom";
import Loading from "../mylib/components/common/loading";

const DialogLazyLoad=loadable(()=>import('./routing'),{fallback:<Loading/>})

export function getDialogRoute(){
    return (
        <Route path='/dialog'><DialogLazyLoad/></Route>
    )
}

export function getDialogRouting(){
    return(
        <ul>
            <li><Link to='/dialog/basic'>动态弹框演示</Link></li>
        </ul>
    )
}