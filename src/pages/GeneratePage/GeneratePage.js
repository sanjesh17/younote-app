import React from "react";
import "./generatepage.css";
import Navbar from "../../components/Navbar/Navbar";
import Generate from "../../components/Generate/Generate";

const GeneratePage = () => {
  return (
    <div className="bg-container">
      <Navbar />
      <Generate />
    </div>
  );
};

export default GeneratePage;
