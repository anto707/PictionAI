import React from "react";
import { useInView } from "react-intersection-observer";

const ScrollAnimation = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.4,
  });

  return (
    <div ref={ref} className={`fade-in-section ${inView ? "is-visible" : ""}`}>
      {children}
    </div>
  );
};

export default ScrollAnimation;
