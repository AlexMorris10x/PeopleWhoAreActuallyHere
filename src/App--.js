import React from 'react';
import './App.css';
import {RadialChart, Hint,
  XYPlot,
  XAxis,
  YAxis,
  ChartLabel,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  LineSeriesCanvas
} from 'react-vis';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation
} from "react-router-dom";

var todoItems = [];
todoItems.push({index: 1, value: "Write my todo list", done: true, time: 10});
todoItems.push({index: 2, value: "learn react", done: true, time: 13});
todoItems.push({index: 3, value: "learn Webpack", done: false, time: 30});
todoItems.push({index: 4, value: "learn ES6", done: false, time: 40});
todoItems.push({index: 5, value: "learn Routing", done: false});
todoItems.push({index: 6, value: "learn Redux", done: false});

function ProtectedPage() {
  return <h3>Protected</h3>;
}
class App extends React.Component {
	render() {
	  return(
		<div className='todoApp'>
    {/* <MenuLinks /> */}
    {/* <Menu /> */}
		<ToDoApp />
		</div>
	  )
	}
}

class MenuLinks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      links: [{
        text: 'Author',
        link: 'https://github.com/Lakston',
      }, 
      {
        text: 'Github page',
        link: 'https://github.com/Lakston',
      }, 
      {
        text: 'Twitter',
        link: 'https://twitter.com/Fab_is_coding',
      },
      {
        text: 'Author',
        link: 'https://github.com/Lakston',
      }
    ]
    }
  }
  render() {
    let links = this.state.links.map((link, i) => <li ref={i + 1}><i aria-hidden="true" className={`fa ${ link.icon }`}></i><a href={link.link} target="_blank">{link.text}</a></li>);

    return (
        <div className={this.props.menuStatus} id='menu'>
          <ul>
            { links }
          </ul>
        </div>
    )
  }
}

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
    this._menuToggle = this._menuToggle.bind(this);
    this._handleDocumentClick = this._handleDocumentClick.bind(this);
  }
  componentDidMount() {
    document.addEventListener('click', this._handleDocumentClick, false);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this._handleDocumentClick, false);
  }
  _handleDocumentClick(e) {
    if (!this.refs.root.contains(e.target) && this.state.isOpen === true) {
      this.setState({
      isOpen: false
    });
    };
  }
  _menuToggle(e) {
    e.stopPropagation();
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    let menuStatus = this.state.isOpen ? 'isopen' : '';

    return (
      <div ref="root">
        <div className="menubar">
          <div className="hambclicker" onClick={ this._menuToggle }></div>
          <div id="hambmenu" className={ menuStatus }><span></span><span></span><span></span><span></span></div>
          <div className="title">
            <span>{ this.props.title }</span>
            <MenuLinks menuStatus={ menuStatus }/>
          </div>
        </div>
      </div>
    )
  }
}

class ToDoApp extends React.Component {
	constructor(props) {
  super(props);
    this.state = {todoItems: todoItems};
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.markTodoDone = this.markTodoDone.bind(this);
  }
  
  addItem(todoItem){
    todoItems.unshift({
      index: todoItems.length+1,
      value: todoItem.newItemValue,
      done: false,
      time: todoItem.timeStamp,
    });
    this.setState({todoItems: todoItems});
  }
  removeItem(itemIndex){
    todoItems.splice(itemIndex,1);
    this.setState({todoItems: todoItems});
  }
  markTodoDone(itemIndex){
    var todo = todoItems[itemIndex];
    todoItems.splice(itemIndex,1);
    todo.done = !todo.done;
    todo.done ? todoItems.push(todo) : todoItems.unshift(todo);
    this.setState({todoItems: todoItems});
  }
  render(){
    return(
      <div className="todoForm">
      <SimplePlotChart />
      <SimpleRadialChart />
      <h3 className="title">ToDo List</h3>
      <TodoForm addItem={this.addItem} />
      <TodoList items={todoItems} removeItem={this.removeItem} markTodoDone={this.markTodoDone} />
      </div>
    )
  }
}

class SimplePlotChart extends React.Component {
  state = {
    useCanvas: false
  };
  render() {
    const {useCanvas} = this.state;
    // const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;

    return (
      <div>
        <button
          onClick={() => this.setState({useCanvas: !useCanvas})}
          // buttonContent={content}
        />
        <XYPlot width={300} height={300}>
          <HorizontalGridLines />
          <VerticalGridLines />
          <XAxis />
          <YAxis />
          <ChartLabel 
            text="X Axis"
            className="alt-x-label"
            includeMargin={false}
            xPercent={0.025}
            yPercent={1.01}
            />

          <ChartLabel 
            text="Y Axis"
            className="alt-y-label"
            includeMargin={false}
            xPercent={0.06}
            yPercent={0.06}
            style={{
              transform: 'rotate(-90)',
              textAnchor: 'end'
            }}
            />
          {/* <Line
            className="first-series"
            data={[{x: 1, y: 3}, {x: 2, y: 5}, {x: 3, y: 15}, {x: 4, y: 12}]}
          /> */}
          <Line
            className="second-series"
            data={ todoItems.map(function(a) { return {x : a.time, y : a.index*(1/todoItems.length)}}) }
          />

          {/* <Line className="second-series" data={null} />
          <Line
            className="third-series"
            curve={'curveMonotoneX'}
            data={[{x: 1, y: 10}, {x: 2, y: 4}, {x: 3, y: 2}, {x: 4, y: 15}]}
            strokeDasharray={useCanvas ? [7, 3] : '7, 3'}
          /> */}
          {/* <Line
            className="fourth-series"
            curve={curveCatmullRom.alpha(0.5)}
            style={{
              // note that this can not be translated to the canvas version
              strokeDasharray: '2 2'
            }}
            data={[{x: 1, y: 7}, {x: 2, y: 11}, {x: 3, y: 9}, {x: 4, y: 2}]}
          /> */}
        </XYPlot>
      </div>
    );
  }
}

class SimpleRadialChart extends React.Component {
  constructor(props) { 
    super(props)
    this.state = {
      value:false
    }
  }

	render() {
  const {value} = this.state;
  return (
    <RadialChart
      className={'donut-chart-example'}
        innerRadius={100}
        radius={140}
        getAngle={d => d.length}
        data={[
          {length: todoItems.length - todoItems.filter(a => a.done === false).length},
          {length: todoItems.length - todoItems.filter(a => a.done === true).length}
        ]}
        onValueMouseOver={v => this.setState({value: v})}
        onSeriesMouseOut={v => this.setState({value: false})}
        width={300}
        height={300}
        padAngle={0.04}
		>
        {value !== false && <Hint value={value} />}
      </RadialChart>
    );
  }
}

  
class TodoForm extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }
  componentDidMount(){
    this.refs.itemName.focus();
  }
  onSubmit(event){
    event.preventDefault();
    var newItemValue = this.refs.itemName.value;
    if(newItemValue){
      this.props.addItem({newItemValue});
      this.refs.form.reset();
    }
    var timeStamp = this.refs.itemName.value;
    if(timeStamp){
      this.props.addItem({newItemValue});
      this.refs.form.reset();
    }
  }
  render(){
    return(
      <form ref="form" onSubmit={this.onSubmit} className="form-inline">
        <input type="text" ref="itemName" className="form-control" placeholder="add a new todo..." />
        <button type="submit" className="btn btn-default"></button>
      </form>
    )
  }
}

class TodoList extends React.Component {
	render(){
	  var items = this.props.items.map((item,index) => {
		return( 
    <TodoListItem key={index} item={item} index={index} removeItem={this.props.removeItem} markTodoDone={this.props.markTodoDone} />
		)});
	  return(
		<ul className="list-group">{items}</ul>
	  );
	}
}

class TodoListItem extends React.Component {
	constructor(props){
	  super(props);
	  this.onClickClose = this.onClickClose.bind(this);
	  this.onClickDone = this.onClickDone.bind(this);
	}
	onClickClose(){
	  var index = parseInt(this.props.index);
	  this.props.removeItem(index);
	}
	onClickDone(){
	  var index = parseInt(this.props.index);
	  this.props.markTodoDone(index);
	}
	render(){
	  var todoClass = this.props.item.done ? "done":"undone";
	  return(
		<li className="list-group-item">
		  <div className={todoClass}>
			{/* <span className="glyphicon glyphicon-ok icon" onClick={this.onClickDone}></span>
			{this.props.item.value} */}
			<span><button type="button" className="glyphicon glyphicon-ok icon" onClick={this.onClickDone}>^</button></span>
			{this.props.item.value}
			<button type="button" className="close" onClick={this.onClickClose}>&times;</button>
		  </div>
		</li>
	  );
	}
}

export default App;


// class TodoHeader extends React.Component {
// 	render(){
// 	  return(
// 		<div className='Header'>
//   	<SimplePlotChart />
// 		<SimpleRadialChart />
// 		<h3 className="title">ToDo List</h3>
// 		</div>
// 	  )
// 	}
// }