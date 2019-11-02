import React from 'react';
import { withRouter } from "react-router"
import auth from "./auth";
// import './App.css';

class Login extends React.Component {
   state = {
      em: '',
      pw: '',
      msg: '',
      jwt: ''
   }
   
   onChange = (e) => {
      this.setState({ [e.target.name]: e.target.value })
   }

   postLogin = (e) => {
      e.preventDefault();
      fetch("http://localhost:5000/login", {
         method: "POST",
         headers: {
            "accept": "application/json",
            "content-type": "application/json"
         },
         body: JSON.stringify({
            em: this.state.em,
            pw: this.state.pw
         })
      })
         .then((res) => res.json())
         .then((json) => {
            this.setState({
               em: '',
               pw: '',
               msg: json.msg,
               jwt: json.jwt
            })
         })
   }
   postSignup = (e) => {
      e.preventDefault();
      console.log(this.state.em, this.state.pw);
      fetch("http://localhost:5000/signup", {
         method: "POST",
         headers: {
            "accept": "application/json",
            "content-type": "application/json"
         },
         body: JSON.stringify({
            em: this.state.em,
            pw: this.state.pw
         })
      })
         .then((res) => res.json())
         .then((json) => {
            this.setState({
               em: '',
               pw: '',
               msg: json.msg,
               jwt: json.jwt
            })
         })
   }

   render() {
      // console.log(json.jwt)
      return (
         <div className="App">
            <form
            >
               <input
                  type="email"
                  name="em"
                  value={this.state.em}
                  onChange={this.onChange}
                  placeholder="email"
               />
               <input
                  type="password"
                  name="pw"
                  value={this.state.pw}
                  onChange={this.onChange}
                  placeholder="password"
               />
               <button
                  onClick={this.postLogin}
               > login
               </button>
               <button
                  onClick={this.postSignup}
               > signup
               </button>
            </form>

            <p>SERVER RESPONSE MESSAGE: {this.state.msg}</p>
            <p>JWT: {this.state.jwt}</p>
         </div>
      );
   }

}

export default withRouter (Login)
