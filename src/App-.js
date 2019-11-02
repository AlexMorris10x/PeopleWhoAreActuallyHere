import React from 'react';
import { BrowserRouter, Route, Link } from "react-router-dom";// var { Router, Route, IndexRoute, Link, browserHistory } = ReactRouter

// Note that with how CodePen works, I wasn't able to get the browserHistory to work
// as the article suggests. The demo works without it, but you'll want to be sure to 
// use it in a real application

   var MainLayout = React.createClass({
      render: function() {
        return (
          <div className="app">
            <header className="primary-header"></header>
            <aside className="primary-aside">
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/users">Users</Link></li>
                <li><Link to="/widgets">Widgets</Link></li>
              </ul>
            </aside>
            <main>
              {this.props.children}
            </main>
          </div>
          )
      }
    })
    
    var Home = React.createClass({
      render: function() {
        return (<h1>Home Page</h1>)
      }
    })
    
    var SearchLayout = React.createClass({
      render: function() {
        return (
          <div className="search">
            <header className="search-header"></header>
            <div className="results">
              {this.props.children}
            </div>
            <div className="search-footer pagination"></div>
          </div>
          )
      }
    })
    
    var UserList = React.createClass({
      render: function() {
        return (
          <ul className="user-list">
            <li>Dan</li>
            <li>Ryan</li>
            <li>Michael</li>
          </ul>
          )
      }
    })
    
    var WidgetList = React.createClass({
      render: function() {
        return (
          <ul className="widget-list">
            <li>Widget 1</li>
            <li>Widget 2</li>
            <li>Widget 3</li>
          </ul>
          )
      }
    })
    
class App extends React.Component {
   render() {
   return(
   <Router>
    <Route path="/" component={MainLayout}>
      <IndexRoute component={Home} />
      <Route component={SearchLayout}>
        <Route path="users" component={UserList} />
        <Route path="widgets" component={WidgetList} />
      </Route> 
    </Route>
  </Router>
   )
   }
}

export default App
