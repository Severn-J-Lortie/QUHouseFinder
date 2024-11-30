import { Datasource } from '../Datasource.js';
import { Listing } from '../Listing.js'
import { OllamaClient } from '../llm/OllamaClient.js';
import fetch from 'node-fetch';

import puppeteer from 'puppeteer';

export class Facebook extends Datasource {
  constructor() {
    const selectors = {
      loginUsername: '#login_popup_cta_form > div > div.xod5an3 > div > div > label > div > input',
      loginPassword: '#login_popup_cta_form > div > div:nth-child(4) > div > div > label > div > input',
      loginButton: '#login_popup_cta_form > div > div:nth-child(5) > div',
      topPost: 'div[data-ad-rendering-role=story_message]',
      seeMore: 'div[role=button]'
    }
    super(  
      'Facebook', 
      'https://www.facebook.com/groups/1618611005028802/?sorting_setting=CHRONOLOGICAL',
      selectors
    );
    this.browser = puppeteer.launch({headless: false});
    if (!(process.env['QU_FACEBOOK_USER'] && process.env['QU_FACEBOOK_PASS'])) {
      throw new Error('Facebook username and password not specified. Please add them to .env file');
    }
    this.facebook_user = process.env['QU_FACEBOOK_USER'];
    this.facebook_pass = process.env['QU_FACEBOOK_PASS'];
    this.ollamaClient = OllamaClient.getInstance();
  }
  async #login(page) {
    const cookies = await page.cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'c_user');
    if (!sessionCookie) {
      await page.type(this.selectors.loginUsername, this.facebook_user);
      await page.type(this.selectors.loginPassword, this.facebook_pass);
      await page.click(this.selectors.loginButton);
      await page.waitForNavigation();
    }
  }
  async fetchListings() {
    const browser = await this.browser;
    const page = await browser.newPage();
    // Deny notifications permission
    await page.goto(this.link);
    await this.#login(page);

    // We are going to pick off only the most recent entry (they are sorted chronologically)
    await page.click('body'); // dismisses notifications popup
    await page.click(`${this.selectors.topPost} ${this.selectors.seeMore}`);
    const topPost = await page.$(this.selectors.topPost);
    const listingText = await topPost.evaluate(el => el.innerText);

    // Gotta get every field with the LLM
    const extractedInfo = await this.ollamaClient.extractInformation('all', listingText); // this worked so well :)
  }
}