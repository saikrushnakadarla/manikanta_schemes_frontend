import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import CustomerRegistration from "./Components/CustomerRegistration/CustomerRegistration";
import LoginPage from "./Components/Login/Login";
import Dashboard from "./Components/Dashboard/Dashboard";
import Organization from "./Components/Organization/Organization";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/register" component={CustomerRegistration} /> 
         <Route exact path="/" component={LoginPage} /> 
          <Route exact path="/dashboard" component={Dashboard} /> 
          <Route exact path="/organization" component={Organization} />
      </Switch>
    </Router>
  ); 
}

export default App;