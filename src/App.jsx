import React, { useState, useEffect } from "react";
import { searchJobs, fetchUrlQueryResponse } from "./scripts/getJobData"; // Importing the searchJobs function
import { Bar, Pie } from "react-chartjs-2"; // Import necessary chart components (Bar, Pie)
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"; // Import necessary Chart.js components
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the datalabels plugin
import SkillBubble from "./components/SkillBubble"; // Import the SkillBubble component
import SkillDropdown from "./components/SkillDropdown";
import JobContainer from "./components/JobContainer";
import SelectedJobContainer from "./components/SelectedJobContainer";
import { useLocation } from 'react-router-dom';
import logo from "./images/logo.png"
import { useNavigate } from 'react-router-dom';



// Register the required chart.js components and the datalabels plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // Register the datalabels plugin
);

function App() {
  const [job, setJob] = useState(""); // Store the job title
  const [city, setCity] = useState(""); // Store the city
  const [state, setState] = useState(""); // Store the state
  const [pages, setPages] = useState(1); // Store the page number (default to 1)
  const [data, setData] = useState(null); // Store the job data
  const [error, setError] = useState(null); // To handle errors
  const [loading, setLoading] = useState(false); // To track loading state

  const [jobData, setjobData] = useState(null)

  const jobElements = [];
  const navigate = useNavigate();

  const goToAnotherPage = () => {
    navigate('/'); // Navigates to /another route
  };


  const location = useLocation(); // Use useLocation to get current URL and params
  const [searchQuery, setSearchQuery] = useState('');


  const handleToggleShowAll = () => {
    setShowAll(!showAll);
  };


  // Handle the search functionality
  const handleSearch = async ({ sQuery = null }) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Start by searching for jobs

      const fullResult = await searchJobs({ job: job, city: city, state: state, alt: sQuery })

      const result = await fullResult[0];
      setjobData(fullResult[1]);
      console.log("This is the fullResukt to send ", fullResult)
      console.log("This is the Result ", result)
      console.log("This is the job Data to send ", jobData)


      // Safeguard to handle cases where result or commonQualifications is undefined
      if (!result || !result.commonQualifications) {
        throw new Error("No qualifications found or failed to fetch data.");
      }

      // Split the qualifications string into a list of skills
      const jobList = result.commonQualifications.split("????");

      if (jobList.length === 0) {
        throw new Error("No qualifications found to query.");
      }

      console.log("Job List:", jobList); // Log the jobList to inspect skill names

      // Fetch URL data for each skill (returns a string with skills separated by new lines)
      const urlResponse = await fetchUrlQueryResponse(jobList.join(", "));

      // Log the raw URL response to inspect its content
      console.log("URL Response from fetchUrlQueryResponse:", urlResponse);

      // Split by new lines, and remove leading/trailing spaces, and filter empty lines
      const urlResults = urlResponse
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && line.includes("http")); // Only keep lines containing URLs

      console.log(urlResults);
      // Debugging logs: Check the lengths and content of both lists
      console.log("Number of Skills:", jobList.length);
      console.log("Number of URL Results:", urlResults.length);
      console.log("URL Results:", urlResults);



      // Sort jobList by frequency (descending order) to match the highest frequency skill first
      const sortedJobList = [...jobList].sort((a, b) => {
        const freqA = parseSkillData(a)?.frequency || 0;
        const freqB = parseSkillData(b)?.frequency || 0;
        return freqB - freqA;
      });

      // Combine sorted jobList with urlResults to create the final data array
      const updatedData = sortedJobList
        .slice(0, jobList.length) // Ensure jobList length remains intact
        .map((skill, index) => ({
          skill,
          rank: index + 1,
          frequency: parseSkillData(skill)?.frequency || 0,
          urlResult: urlResults[index] || "https://default-url.com", // Add default URL if missing
        }));


      console.log("Updated Data:", updatedData); // Check the final updatedData

      setData(updatedData); // Update the state with the new data

    } catch (err) {
      // General error handling
      console.error("Error in handleSearch:", err);
      setError("Failed to fetch job data. Please try again.");
    } finally {
      setLoading(false);
    }
  };





  const parseSkillData = (item) => {
    const regex = /(.*) - (\d+) times/;
    const match = item.match(regex);
    if (match) {
      return {

        frequency: parseInt(match[2], 10)
      };
    }
    return null;
  };

  const parsedData = data
    ? data
      .map((item) => ({
        skill: item.skill,
        frequency: item.frequency || 0, // Extract skill and frequency
        rank: item.rank, // Add rank from updatedData
        urlResult: item.urlResult, // Add urlResult from updatedData
      }))
      .filter((item) => item !== null)
    : [];
  // Sort the parsedData by frequency
  const sortedData = [...parsedData].sort((a, b) => b.frequency - a.frequency);

  // Calculate total frequency
  const totalFrequency = parsedData.reduce((acc, item) => acc + item.frequency, 0);

  // Bar chart data
  const barChartData = data
    ? {
      labels: sortedData.map((item) => item.skill),
      datasets: [
        {
          label: "Frequency",
          data: sortedData.map((item) => item.frequency),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    }
    : null;

  // Pie chart data
  const pieChartData = data
    ? {
      labels: sortedData.map((item) => item.skill),
      datasets: [
        {
          data: sortedData.map((item) => (item.frequency / totalFrequency) * 100),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#FF9F40",
            "#4BC0C0",
            "#9966FF",
            "#FF33CC",
            "#FF6699",
          ],
        },
      ],
    }
    : null;

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams(location.search);
      const query = params.get("query");

      if (query) {
        // Validate query
        if (query.trim().length > 0 && /^[a-zA-Z0-9\s]*$/.test(query)) {
          setSearchQuery(query); // Update searchQuery
          setError(""); // Clear previous errors
        } else {
          setError("Invalid query format. Please try again with a valid search term.");
          setSearchQuery(""); // Clear the query if invalid
          return; // Exit early
        }
      } else {
        setError("No search query provided.");
        setSearchQuery(""); // Optional: Set default query or leave empty
        return; // Exit early
      }

      // Perform search once searchQuery is set
      await handleSearch({ sQuery: query });
    };

    fetchData();

    return () => {
      Object.keys(ChartJS.instances).forEach((id) => {
        ChartJS.instances[id].destroy();
      });
    };
  }, [location.search]);


  const organizeBubblesInPyramid = (sortedData) => {
    const rows = [];
    let index = 0;

    for (let rowCount = 1; index < sortedData.length; rowCount++) {
      rows.push(sortedData.slice(index, index + rowCount));
      index += rowCount;
    }

    return rows;
  };

  const pyramidRows = organizeBubblesInPyramid(sortedData);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center align-middle  text-black font-sans   ">
      {/* Search Section */}





      <div className="w-full bg-white p-2 shadow-md fixed top-0 left-0 right-0 z-10 items-center align-middle flex justify-center">

        <div
          className="relative top-0 cursor-pointer left-0 " // Positioning the logo
          style={{
            backgroundImage: `url(${logo})`,
            width: '140px', // You can adjust the size here
            height: '140px', // Maintain aspect ratio
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          onClick={goToAnotherPage}

        />


        <div className="max-w-6xl mx-auto flex justify-between items-center space-x-6">
          <h1 className="text-3xl font-semibold text-gray-800">Job Skill Search</h1>
          <div className="flex items-center space-x-4">
            {/* Input Fields */}
            <input
              type="text"
              placeholder="Job Title"
              className="p-3 rounded-lg bg-gray-100 text-black w-56 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={job}
              onChange={(e) => setJob(e.target.value)}
            />
            <input
              type="text"
              placeholder="City"
              className="p-3 rounded-lg bg-gray-100 text-black w-56 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              type="text"
              placeholder="State"
              className="p-3 rounded-lg bg-gray-100 text-black w-56 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />

            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>
      </div>


      {/* <JobContainer jobData={jobData} /> */}
      <div className="w-full mt-36 lg:w-[30%] bg-white p-6 rounded-lg align-middle items-center shadow-md border border-gray-300 mb-14 lg:mb-0">
        <h2 className="text-2xl text-gray-700  flex justify-center items-center">{searchQuery}</h2>
        <h2 className="text-xs italic text-gray-700  flex justify-center items-center">*Data from common job board websites*</h2>

      </div>



      {/* Main Content */}
      <div className="w-full  mt-12  flex flex-col lg:flex-row justify-center  ">

        {/* Elements List Section (Left) */}


        <div className="w-[25%] bg-white p-6 rounded-lg shadow-md border border-gray-300 mb-6 text-center flex flex-col ">
          <h2 className="text-2xl text-gray-700 mb-6 flex justify-center items-center">Top 10 Needed Skills For This Job</h2>
          <h2 className="text-xs text-gray-700 flex justify-center italic items-center">*Most common skills found on job boards
            *</h2>
          
          <hr className='mt-8' />
          {loading ? "Loading..." : ""}
          <div className="space-y-4 flex flex-col items-center">
            <SkillDropdown data={data} />
          </div>
        </div>

        <div className="w-full ml-8 mr-8 lg:w-[40%] bg-white p-6 rounded-lg shadow-md border border-gray-300 text-center mb-14 lg:mb-0">
          <h2 className="text-2xl text-gray-700 mb-6 flex justify-center items-center">Skill Resource Bubbles</h2>
          <h2 className="text-xs text-gray-700 flex justify-center italic items-center">*Click on card to reveal resource to learn*
            *</h2>
          
          <hr className='mt-8' />

          {loading ? "Loading..." : ""}
          <div className="grid gap-6">
            {(() => {
              // Flatten the pyramidRows into a single array
              const flatSkills = pyramidRows.flat();

              // Sort the skills by rank (ascending order)
              const sortedSkills = flatSkills.sort((a, b) => a.rank - b.rank);

              // Take the top 10 skills
              const topSkills = sortedSkills.slice(0, 10);

              // Group the skills into rows for pyramid layout (1 item in the first row, 2 items in the second, etc.)
              const rows = [];
              let itemsLeft = topSkills.length;

              // Create rows dynamically based on available items
              let i = 0;
              let rowSize = 1;
              while (itemsLeft > 0) {
                rows.push(topSkills.slice(i, i + rowSize));
                i += rowSize;
                itemsLeft -= rowSize;
                rowSize++; // Increase the number of items in the next row
              }

              // Render the rows in a pyramid style
              return rows.map((row, index) => (
                <div
                  key={index}
                  className={`flex flex-wrap justify-center ${index === rows.length - 1 ? 'space-x-4' : 'space-x-6'}`}
                >
                  {row.map((item, itemIndex) => {
                    const skillData = data.find((d) => d.skill === item.skill);
                    const urlResult = skillData ? skillData.urlResult : null;
                    return (
                      <SkillBubble
                        key={itemIndex}
                        skill={item.skill}
                        rank={item.rank}
                        frequency={item.frequency}
                        maxFrequency={totalFrequency}
                        urlResult={urlResult} // Pass urlResult to SkillBubble
                      />
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        </div>


        {/* Charts Section (Right) */}
        <div className="w-full lg:w-[25%] bg-white p-6 rounded-lg shadow-md border border-gray-300 mb-6 lg:mb-0 flex flex-col  ">
          <h2 className="text-2xl text-gray-700 mb-6 flex justify-center items-center">Charts</h2>
          <h2 className="text-xs text-gray-700 flex justify-center italic items-center">*Hover over charts to see data
            *</h2>
          
          <hr className='mt-8' />
          <div className="flex flex-col space-y-8 items-center">
          {loading ? "Loading..." : ""}
            {barChartData && barChartData.labels.length > 0 && (
              <Bar
                data={barChartData}
                className="mb-8"
                options={{
                  scales: {
                    x: { display: false },
                    y: { ticks: { beginAtZero: true } },
                  },
                  plugins: {
                    datalabels: {
                      display: true,
                      color: "white",
                      anchor: "end",
                      align: "end",
                    },
                  },
                }}
              />
            )}
            {pieChartData && pieChartData.labels.length > 0 && (
              <Pie
                data={pieChartData}
                options={{
                  plugins: {
                    datalabels: {
                      display: true,
                      formatter: (value) => `${value.toFixed(1)}%`,
                      color: "white",
                      font: { weight: "bold" },
                    },
                    legend: { display: false },
                  },
                  responsive: true,
                }}
                style={{ width: "300px", height: "300px" }} // Set explicit width and height
              />
            )}
          </div>
        </div>

      </div>









      {/* Error Message */}
      {error && <div className="text-red-500 text-center">{error}</div>}
    </div>
  );
}

export default App;
