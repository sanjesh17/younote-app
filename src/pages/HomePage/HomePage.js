import React from "react";
import "./homepage.css";
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";

const HomePage = () => {
  return (
    <div className="bg-container">
      <Navbar />
      <Hero />
    </div>
  );
};

export default HomePage;
