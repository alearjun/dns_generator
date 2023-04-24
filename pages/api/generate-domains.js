import AWS from 'aws-sdk';
import 'openai';

// Initialize AWS SDK and Route53Domains client
const route53domains = new AWS.Route53Domains({
  apiVersion: '2014-05-15',
  accessKeyId: process.env.MY_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_APP_AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

// Initialize OpenAI API client
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.MY_APP_OPENAI_API_KEY,
});

async function generateDomainNames(keywords, tlds) {
  const prompt = `Act as an award winning consultant for naming companies. Based on the keywords, "${keywords}" generate 20 creative names for a company using the keywords.  Think beyond simply combining parts of the keywords and consider wordplay, puns, or other creative ideas to make the names stand out. Your job is to return a list of domain names for the company based on the names you come up with. Use the following top-level domains: ${tlds.join(', ')}. Your response should only be a list of domain names and nothing else.`;

  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {role: "user", content: prompt}
    ],
    max_tokens: 1000,
  });

  const domainNames = completion.data.choices[0].message.content
    .trim()
    .toLowerCase()
    .split('\n')
    .map((name) => name.replace(/^\d+\. /, "")); // remove numbering

  console.log(domainNames);

  return domainNames;
}

async function checkDomainAvailability(domainName, retryCount = 0) {
  const maxRetries = 4;
  const waitTime = 2000; // 2 second

  const params = {
    DomainName: domainName.trim(),
    IdnLangCode: 'eng',
  };

  try {
    const result = await route53domains.checkDomainAvailability(params).promise();
    return result.Availability === 'AVAILABLE';
  } catch (error) {
    if (error.code === 'ThrottlingException' && retryCount < maxRetries) {
      console.warn(`Rate limit exceeded. Retrying in ${(waitTime * (2 ** retryCount)) / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime * (2 ** retryCount)));
      return checkDomainAvailability(domainName, retryCount + 1);
    } else {
      console.error(error);
      return false;
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const keywords = req.query.keywords;
  console.log("Raw tlds query parameter:", req.query.tlds);
  const tlds = req.query.tlds ? req.query.tlds.split(',') : [];
  if (!keywords) {
    res.status(400).send('Bad Request: Missing keywords.');
    return;
  }

  try {
    const domainNames = await generateDomainNames(keywords, tlds);
    const availabilityPromises = domainNames.map(checkDomainAvailability);
    const availability = await Promise.all(availabilityPromises);

    const domains = domainNames.map((name, index) => ({
      Name: name,
      Available: availability[index],
    }));

    res.status(200).json({ domains: domains });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
    }
  }