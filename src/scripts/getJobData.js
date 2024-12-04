import axios from "axios";
import { OpenAI } from "openai"; // Import OpenAI directly from the new package

import { useState } from "react";

// Export searchJobs using ES module export
export const searchJobs = async ({
  job,
  city,
  state,
  alt = null,
  pages = 3,
}) => {
  const options = {
    method: "GET",
    url: "https://jsearch.p.rapidapi.com/search",
    params: {
      query: alt ? alt : `${job} in ${city}, ${state}`,
      page: "1",
      num_pages: pages,
      country: "us",
      date_posted: "all",
    },
    headers: {
      "x-rapidapi-key": "", //add your own api key i took mine out for obvious reasons
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);

    // Extract and combine all qualifications into one array
    const qualifications = response.data.data
      .map((job) => job.job_highlights?.Qualifications || []) // Safely access Qualifications
      .flat(); // Flatten the array to combine all qualifications

    console.log("wuala: ", qualifications); // Log the combined qualifications array

    // Post the combined qualifications to the qualifications endpoint
    try {
      const response1 = await axios.post(
        "http://localhost:5000/api/qualifications",
        {
          qualificationsList: qualifications, // Send qualifications as qualificationsList
        }
      );
      console.log("Common Qualifications:", response1);
      console.log("Common Qualifications:", response1.data);

      console.log(
        "Common Qualifications:",
        response1.data.commonQualifications
      );

      return [response1.data, response]; // Returning the response
    } catch (error2) {
      console.error("Error fetching job qualifications:", error2);
      console.log("Error response:", error2.response?.data); // Log any response error from the server
    }
  } catch (error) {
    console.error("Error fetching job listings:", error);
    throw error; // Rethrow the error if needed
  }
};

export const fetchUrlQueryResponse = async (inputString) => {
  try {
    console.log("Sending input:", inputString); // Log the input
    const response = await axios.post("http://localhost:5000/api/query", {
      inputString, // Send the inputString in the request body
    });
    console.log("Response from API:", response.data);
    console.log("Response from API:", response.data.response);
    return response.data.response; // Return the GPT response for further use
  } catch (error) {
    console.error(
      "Error fetching the API:",
      error.response?.data?.error || error.message
    );
    console.error(
      "Error fetching the API2:",
      error.response || error.message || error
    );

    console.error(error); // Log the full error object for more insight
    throw error; // Re-throw the error for higher-level handling
  }
};
