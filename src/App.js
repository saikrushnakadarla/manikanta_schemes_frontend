import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import CustomerRegistration from "./Components/CustomerRegistration/CustomerRegistration";
import LoginPage from "./Components/Login/Login";
import Dashboard from "./Components/Dashboard/Dashboard";
import Organization from "./Components/Organization/Organization";
import Users from "./Components/Users/Users";
import UsersForm from "./Components/Users/UsersForm";
import Schemes from "./Components/Schemes/Schemes";
import SchemesForm from "./Components/Schemes/SchemesForm";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/register" component={CustomerRegistration} /> 
         <Route exact path="/" component={LoginPage} /> 
          <Route exact path="/dashboard" component={Dashboard} /> 
          <Route exact path="/organization" component={Organization} /> 
          <Route exact path="/users" component={Users} /> 
<Route exact path="/schemes" component={Schemes} /> 
<Route exact path="/schemesform" component={SchemesForm} />
          <Route exact path="/usersform" component={UsersForm} />
      </Switch>
    </Router>
  ); 
}

export default App;