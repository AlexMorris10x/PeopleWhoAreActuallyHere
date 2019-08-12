import React from 'react';
import './Header.css';

export default class Header extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {

    return (
      <header className="navbar">
        <a href="https://github.com/AlexMorris10x/PeopleWhoAreActuallyHere">source code</a>
      </header>
    );
  }
}
