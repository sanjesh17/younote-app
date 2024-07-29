import React from "react";
import "./navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="navbar-container">
      <div className="navbar-logo">
        <Link
          to="/home"
          style={{ color: "white", border: 0, textDecoration: "none" }}
        >
          <h2>YouNote</h2>
        </Link>
      </div>
      <div className="navbar-links">
        <Link
          to="/home"
          style={{ color: "white", border: 0, textDecoration: "none" }}
        >
          <p>Home</p>
        </Link>
        <Link
          to="/generate"
          style={{ color: "white", border: 0, textDecoration: "none" }}
        >
          <p>Generate</p>
        </Link>
        <p>Tools</p>
      </div>
      <div className="auth-links">
        <button type="button" className="sign-button">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Navbar;
