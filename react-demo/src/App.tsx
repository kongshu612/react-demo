import React from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter,Link,Switch} from 'react-router-dom';
import { getFlexFormRoute, getFlexFormRouting } from './flex-form-demo/lazy-route';
import {Collapse} from 'antd';
import { getDialogRoute, getDialogRouting } from './dialog-demo/lazy-route';

const {Panel}=Collapse;




function App() {
  return (
    <div>
      <div className="header">
         展现一些学习React 过程中写的一些组件
      </div>
      <BrowserRouter>
        <div className="App">
          <div className="left-panel">
            <Collapse>
              <Panel header='动态表单' key='0'>
                {
                  getFlexFormRouting()
                }
              </Panel> 
              <Panel header='动态弹框' key='1'>
                {
                  getDialogRouting()
                }
              </Panel>       
            </Collapse>
          </div>
          <div className="right-panel">        
            <Switch>
              {
                getFlexFormRoute()
              }
              {
                getDialogRoute()
              }
            </Switch>
          </div>
        </div>
        </BrowserRouter>
    </div>
    
  );
}

export default App;
