import { HfInference } from '@huggingface/inference'
import { Model } from './Model.js';

export class HFClient {
  static #instance = null;
  constructor() {
    if (HFClient.#instance) {
      throw new Error('Use getInstance()');
    }
    if (!process.env.QU_HF_CLIENT_TOKEN) {
      throw new Error('No HF Client token found in environment');
    }
    const accessToken = process.env.QU_HF_CLIENT_TOKEN;
    this.hf = new HfInference(accessToken);
    this.model = new Model();
    HFClient.#instance = this;
  }
  async generateCompletion(fields, content) {
    const messages = this.model.createPrompt(fields, content);

    const result = await this.hf.chatCompletion({
      model: Model.MODEL,
      messages
    })
    return JSON.parse(result.choices[0].message.content);
  }
  static getInstance() {
    if (!HFClient.#instance) {
      HFClient.#instance = new HFClient();
    }
    return HFClient.#instance;
  }
}