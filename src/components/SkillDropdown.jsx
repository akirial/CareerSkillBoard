import React, { useState } from "react";

const SkillDropdown = ({ data }) => {
  // Ensure 'data' is an array before proceeding
  const [showAll, setShowAll] = useState(true);

  if (!Array.isArray(data)) {
    return <></>; // Handle the case when data is not an array
  }

  return (
    <div className="relative">
      <div className="border rounded p-2 w-full flex flex-col">
        <ul className="max-h-full overflow-y-auto flex-grow">
          {data.slice(0, showAll ? data.length : 10).map((item, index) => (
            <li key={index} className="text-gray-700 p-2">
              {item.skill}
            </li>
          ))}
        </ul>
        {data.length > 10 && (
          <button
            className="text-white bg-blue-500 p-10 mt-2 py-1 px-40  border-none rounded-3xl text-sm cursor-pointer hover:underline self-center"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Show Less ^" : "Show More V"}
          </button>
        )}
      </div>
    </div>
  );
  
};

export default SkillDropdown;
