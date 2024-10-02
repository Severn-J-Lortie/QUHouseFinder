import fetch from 'node-fetch';
import { Model } from './Model.js';

export class OllamaClient {
  static #instance = null;
  static #PORT = 11434;
  static #HOST = 'localhost';
  constructor() {
    if (OllamaClient.#instance) {
      throw new Error('Use getInstance()');
    }
    if (process.env['QU_OLLAMA_PORT']) {
      OllamaClient.#PORT = Number(process.env['QU_OLLAMA_PORT']);
    }
    if (process.env['QU_OLLAMA_HOST']) {
      OllamaClient.#HOST = process.env['QU_OLLAMA_HOST'];
    }
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
        format: 'json'
      })
    });
    const responseJSON = await response.json();
  }
  static getInstance() {
    if (!OllamaClient.#instance) {
      OllamaClient.#instance = new OllamaClient();
    }
    return OllamaClient.#instance;
  }
}