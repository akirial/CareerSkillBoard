import React from 'react'

const JobElement = ({jobNumber, startScreen =false}) => {
  return (
    <>
    
    
    <div className={`flex-none ${startScreen ? 'w-[30rem] h-[24rem]' : 'w-72 h-56'} mr-4 bg-gray-100 p-4 rounded-lg shadow-md`}>
            <p>Job {jobNumber}</p>
          </div>
    
    
    
    
    </>
  )
}

export default JobElement