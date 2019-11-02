import React from "react";
import auth from "./auth";

export const LandingPage = props => {
  return (
    <div>
      <h1>Landing Page</h1>
      <button
        onClick={() => {
          auth.login(() => {
            props.history.push("/app");
          });
        }}
      >
        Login
      </button>
    </div>
  );
};
