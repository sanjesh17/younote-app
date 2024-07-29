import React from "react";
import { Link } from "react-router-dom";
import "./hero.css";
import withFadeInFromBottom from "../HOC/withFadeInFromBottom";

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <div className="update-pill">
          <p>Initial Version of YouNote Out Now!</p>
        </div>
        <div className="text-container">
          <h1>Note Taking, Made Fun!</h1>
          <h3>AI-Powered Note Taking and Contextual Chat for YouTube</h3>
        </div>
        <div className="start-button">
          <div className="btn-start">
            <Link to="/generate">
              <button type="button">Get Started</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withFadeInFromBottom(Hero);
