import { createRequire } from 'node:module';
import { HfInference } from '@huggingface/inference'
import { Model } from './Model.js';

export class HFClient {
  static #instance = null;
  constructor() {
    if (instance) {
      throw new Error('Use getInstance()');
    }
    const require = createRequire(import.meta.url);
    const accessToken = require('./token.json');
    this.hf = new HfInference(accessToken.token);
    this.model = new Model();
    HFClient.#instance = this;
  }
  async generateCompletion(fields, content) {
    const messages = this.model.createPrompt(fields, content);

    const result = await this.hf.chatCompletion({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      messages
    })
    return result.choices[0].message;
  }
  getInstance() {
    if (!HFClient.#instance) {
      HFClient.#instance = new HFClient();
    }
    return HFClient.#instance;
  }
}