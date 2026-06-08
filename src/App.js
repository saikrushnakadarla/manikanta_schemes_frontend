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
import Customers from "./Components/Customers/Customers";
import CustomersForm from "./Components/Customers/CustomersForm";
import CustomerSchemesEnrolment from "./Components/CustomerSchemesEnrolment/CustomerSchemesEnrolment"; 
import CustomerSchemesEnrolmentForm from "./Components/CustomerSchemesEnrolment/CustomerSchemesEnrolmentForm"

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
          <Route exact path="/customers" component={Customers} /> 
          <Route exact path="/customersform" component={CustomersForm} /> 
          <Route exact path="/customerschemesenrolment" component={CustomerSchemesEnrolment} /> 
          <Route exact path="/customerschemesenrolmentform" component={CustomerSchemesEnrolmentForm} />
      </Switch>
    </Router>
  ); 
}

export default App;