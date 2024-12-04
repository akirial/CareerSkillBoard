import React, { useRef, useState, useEffect } from 'react';
import JobElement from './JobElement';

const SelectedJobContainer = () => {
  
  return (
    <div className="w-full  h-auto bg-white p-6 rounded-lg shadow-md border overflow-x-hidden border-gray-300 mr-12 lg:mb-0" style={{height: "1615px"}}>
        <div className='flex justify-center align-middle items-center  text-gray-700 text-4xl '><h1>This is The Selected Job</h1></div>
        <hr className='mt-8' />
     



    </div>
  );
};

export default SelectedJobContainer;
