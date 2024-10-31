import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const openaiClient = axios.create({
  baseURL: OPENAI_API_URL,
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function generateCompletion(prompt, options = {}) {
  try {
    const response = await openaiClient.post('', {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.max_tokens || 500,
      temperature: options.temperature || 0.7,
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

export async function generateAutoCompletion(currentText) {
  const prompt = `Continue this text naturally (provide just the continuation, no quotes): "${currentText}"`;
  const response = await generateCompletion(prompt, { 
    max_tokens: 50,
    temperature: 0.7,
    // Lower temperature for more focused suggestions
  });
  return response;
}

export async function generateTitle(content) {
    const prompt = `Generate a short, engaging title for this note: "${content}". Return only the title without quotes.`;
    const response = await generateCompletion(prompt, { max_tokens: 30, temperature: 0.7 });
    // Remove any remaining quotes from the response
    return response.replace(/"/g, ''); // Only remove double quotes
  }

export async function generateTags(content) {
  const prompt = `Generate 3-5 relevant tags for this text, return only the tags separated by commas without '#' symbol: "${content}"`;
  const response = await generateCompletion(prompt, { max_tokens: 100, temperature: 0.7 });
  return response.split(',').map(tag => tag.trim());
}

export async function formatText(text, instruction) {
    const prompt = `${instruction}. Remember to only output the modified text without any explanations or additional context: "${text}"`;
    const response = await generateCompletion(prompt, { 
      max_tokens: 100, 
      temperature: 0.7,
      // Add a system message to enforce the output format
      messages: [
        {
          role: "system",
          content: "You are a text formatter. Always respond with only the formatted text, without any explanations or additional context."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });
    return response.replace(/"/g, ''); // Only remove double quotes
  }