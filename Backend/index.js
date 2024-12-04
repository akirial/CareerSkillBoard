const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors')


const app = express();
const port = 5000;

// Allow Cross-Origin requests from your React app
app.use(cors());
 // For parsing application/json
app.use(express.json({ limit: '50mb' })); // Increase the payload limit

// Initialize OpenAI API client
const openAI = new OpenAI({
  apiKey: '', //took my key out for obvious reasons, pls put in your own
});
//org-uxdcY4sfeMfKWxDQZcwIWgT0
// POST route to handle qualifications and return common ones
app.post('/api/qualifications', async (req, res) => {
    const { qualificationsList } = req.body;
  
    if (!qualificationsList || qualificationsList.length === 0) {
      return res.status(400).send({ error: 'Qualifications list is empty' });
    }
  
    try {
      const prompt = `
        Here are the qualifications from multiple job postings:
  
        ${qualificationsList.join("\n")}
  
        Please identify the most common qualifications and provide their frequency displayed as a list with each elemeent seperated by 4 question marks from greatest to least
      `;
  
      // Attempt to use GPT-4 model, if that fails, try GPT-3.5
      let model = 'gpt-4';
      let response;
  
      try {
        response = await openAI.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.5,
        });
      } catch (error) {
        if (error.code === 'model_not_found') {
          console.error("GPT-4 not available, falling back to GPT-3.5");
          model = 'gpt-3.5-turbo'; // Fallback model
          response = await openAI.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
            temperature: 0.5,
          });
        } else {
          throw error; // Rethrow other errors
        }
      }
  
      res.json({ commonQualifications: response.choices[0].message.content.trim() });
    } catch (error) {
      console.error("Error fetching GPT response:", error);
      res.status(500).send({ error: 'Failed to fetch common qualifications' });
    }
  });


// POST route to handle any string input and get a response from OpenAI
app.post('/api/query', async (req, res) => {
  const { inputString } = req.body;

  // Check if inputString exists and is a string
  if (typeof inputString !== 'string' || inputString.trim().length === 0) {
    return res.status(400).send({ error: 'Input string is empty or not a string' });
  }

  try {
    const prompt = `
      I am giving you a list of skills needed, can you pls give me 1 links/resources for each that would aid in gaining these skills, the lists can be from educational websites like udemy or from wherever. the elements might be seperated by ????
      ${inputString}
    `;

    // Attempt to use GPT-4 model, if that fails, try GPT-3.5
    let model = 'gpt-4';
    let response;

    try {
      response = await openAI.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.5,
      });
    } catch (error) {
      if (error.code === 'model_not_found') {
        console.error("GPT-4 not available, falling back to GPT-3.5");
        model = 'gpt-3.5-turbo'; // Fallback model
        response = await openAI.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.5,
        });
      } else {
        throw error; // Rethrow other errors
      }
    }

    res.json({ response: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Error fetching GPT response:", error);
    res.status(500).send({ error: 'Failed to process the request' });
  }
});



app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
