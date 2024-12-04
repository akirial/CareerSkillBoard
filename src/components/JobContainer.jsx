import React, { useRef, useState, useEffect } from 'react';
import JobElement from './JobElement';

const JobContainer = ( {jobData, startScreen = false}) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollLeft = () => {
    const scrollContainer = scrollContainerRef.current;
    scrollContainer.scrollBy({
      left: -2100, // Scroll 800px to the left
      behavior: 'smooth', // Smooth scrolling
    });
  };

  const scrollRight = () => {
    const scrollContainer = scrollContainerRef.current;
    scrollContainer.scrollBy({
      left: 2100, // Scroll 800px to the right
      behavior: 'smooth', // Smooth scrolling
    });
  };

  const updateArrowsVisibility = () => {
    const scrollContainer = scrollContainerRef.current;
    const maxScrollLeft =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;

    setShowLeftArrow(scrollContainer.scrollLeft > 0);
    setShowRightArrow(scrollContainer.scrollLeft < maxScrollLeft - 5);
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    // Update arrows visibility on initial load
    updateArrowsVisibility();

    

    // Attach scroll event listener
    scrollContainer.addEventListener('scroll', updateArrowsVisibility);

    // Cleanup event listener
    return () => {
      scrollContainer.removeEventListener('scroll', updateArrowsVisibility);
    };
  }, []);

  const jobElements = [];

  for (let i = 0; i < 30; i++) {
    jobElements.push(<JobElement key={i} jobNumber={i + 1} startScreen={startScreen} />);
  }

  return (
    <div className={`shadow-2xl relative w-full ${!startScreen && "mt-36"}`}>
      {/* Left Scroll Arrow */}
      {showLeftArrow && (
        <button
          className="ml-4 absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-500 text-white rounded-full"
          onClick={scrollLeft}
        >
          &#8592;
        </button>
      )}

      {/* Right Scroll Arrow */}
      {showRightArrow && (
        <button
          className="mr-4 absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-500 text-white rounded-full"
          onClick={scrollRight}
        >
          &#8594;
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="w-full h-auto bg-white p-6 rounded-lg shadow-md border overflow-x-hidden border-gray-300 mb-6 lg:mb-0"
      >
        <div className="flex space-x-4">{jobElements}</div>
      </div>
    </div>
  );
};

export default JobContainer;
