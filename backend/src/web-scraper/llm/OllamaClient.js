import fetch from 'node-fetch';
import { Model } from './Model.js';
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
    this.model = new Model();
    OllamaClient.#instance = this;
  }
  async extractInformation(fields, content) {
    const messages = this.model.createPrompt(fields, content);
    const response = await fetch(`http://${OllamaClient.#HOST}:${OllamaClient.#PORT}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({
        model: Model.MODEL,
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