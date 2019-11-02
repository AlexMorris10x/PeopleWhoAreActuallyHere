import React from "react";
import ReactDOM from "react-dom";
import { Login } from "./login";
import { AppLayout } from "./app.layout";
import { ProtectedRoute } from "./protected.route";

import { BrowserRouter, Route, Switch } from "react-router-dom";

// import "./styles.css";

class App extends React.Component {
render() {
  return (
    <div className="App">

      <Switch>
        <Route exact path="/" component={Login} />
        <ProtectedRoute exact path="/app" component={AppLayout} />
        <Route path="*" component={() => "404 NOT FOUND"} />
      </Switch>
    </div>
  );
}
}
  
export default App