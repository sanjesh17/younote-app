import React, { useEffect, useState } from "react";
import "./withfadeinfrombottom.css";

const withFadeInFromBottom = (WrappedComponent) => {
  return (props) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100); 

      return () => clearTimeout(timer);
    }, []);

    return (
      <div className={`fade-in-from-bottom ${isVisible ? "visible" : ""}`}>
        <WrappedComponent {...props} />
      </div>
    );
  };
};

export default withFadeInFromBottom;
