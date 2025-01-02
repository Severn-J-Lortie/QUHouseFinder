import fetch from 'node-fetch';
import { Logger } from '../../Logger.js';

export class OllamaClient {
  static #instance = null;
  static #PORT = 0;
  static #HOST = '';
  constructor() {
    if (OllamaClient.#instance) {
      throw new Error('Use getInstance()');
    }
    if (!process.env['QU_OLLAMA_PORT']) {
      throw new Error('Must specify an QU_OLLAMA_PORT environment variable');
    }
    if (!process.env['QU_OLLAMA_HOST']) {
      throw new Error('Must specify an QU_OLLAMA_HOST environment variable');
    }
    OllamaClient.#PORT = Number(process.env['QU_OLLAMA_PORT']);
    OllamaClient.#HOST = process.env['QU_OLLAMA_HOST'];
    OllamaClient.#instance = this;
  }
  async extractInformation(fields, content) {
    if (!(fields instanceof Array) && fields !== 'all') {
      throw new Error('fields argument must be an array or "all"');
    }
    const fieldDescriptors = {
      leaseStartDate:`
leaseStartDate: <lease start date. The date field should be populated with a date 
of the form Month Day, Year. E.g. September 1, 2024. If the listing is available "now" or
"immediately", then put today's date. If a year isn't provided, assume the current year.>`,
      totalPrice: 'totalPrice: <the rent>',
      beds: 'beds: <number of beds>\n',
      leaseType: 'leaseType: <Sublet/Lease>\n',
      address: `
address: <number and street, e.g. 1-23 Princess St or A23 Toronto St. If you cannot find it,
a very brief description of the location. This should NEVER be null.>\n`
    }

    let fieldMessage = '';
    if (fields !== 'all') {
      for (const field of fields) {
        fieldMessage += fieldDescriptors[field];
      }
    } else {
      for (const field in fieldDescriptors) {
        fieldMessage += fieldDescriptors[field];
      }
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const taskMessage =`
Today's date: ${formattedDate}.
Location: Kingston, Ontario

Your task is to extract specific details from the text the user provides. 
Respond only with the details in the exact format they specify, with no 
additional comments, explanations, or reasoning. If you can't find a 
specific detail, or if you are unsure, just use null for that field.
Required format is a JSON object with ONLY the following fields:
${fieldMessage}
The output must always be valid a valid JSON object (so just null is not
sufficient).`;
    const messages = [
      {
        role: 'system',
        content: taskMessage
      },
      {
        role: 'user',
        content
      }
    ]
    return (await this.requestOllama(messages));
  }
  async determineIfListing(listing) {
    const messages = [
      {
        role: 'system',
        content: `
Your task is to figure out if text the user provides is a listing for a rental lease or sublet. It cannot anything else.
For example, it cannot be someone looking for a lease or sublet, they absolutely must be offering something, not looking
for something. Additionally, filter out all other irrelevant things that do not pretain to listings for leases and sublets.
Respond with a JSON object that only has the key "isListing." isListing is true if the text is a relevant advertisement for
a sublet or lease and false otherwise.

Example 1:
Text: "Central house 15 minute walk from Queen's Campus. 2 rooms, 1 bathroom. $2000/month. Contact if interested."
Output: {isListing: true}

Example 2:
Text: "Hey everyone! I am looking for a house for next year. I am an undergraduate computer science student in second year.
I am looking for a 4-month lease or sublet."
Output {isListing: false}
`
      },
      {
        role: 'user',
        content: listing
      }
    ];
    console.log(messages);
    const result = await this.requestOllama(messages);
    return result.isListing;
  }
  async requestOllama(messages) {
    const response = await fetch(`http://${OllamaClient.#HOST}:${OllamaClient.#PORT}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({
        model: 'gemma2:2b-instruct-fp16',
        messages,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.8,
          seed: 100
        }
      })
    });
    const responseJSON = await response.json();
    let responseContent = responseJSON.message.content;
    try {
      responseContent = JSON.parse(responseContent);
      // "null" --> null conversion
      for (const key in responseContent) {
        if (responseContent[key] === 'null') {
          responseContent[key] = null;
        }
      }
    } catch (error) {
      Logger.getInstance().err(`Model failed to return properly formatted JSON. Got ${content}`);
      throw error;
    }
    return responseContent;
  }
  static getInstance() {
    if (!OllamaClient.#instance) {
      OllamaClient.#instance = new OllamaClient();
    }
    return OllamaClient.#instance;
  }
}