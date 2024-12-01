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
      feed: 'div[role=feed] > div',
      description: 'div[data-ad-rendering-role=story_message]',
      seeMore: 'div[role=button]'
    }
    super(
      'Facebook',
      'https://www.facebook.com/groups/1618611005028802/?sorting_setting=CHRONOLOGICAL',
      selectors
    );
    this.browser = puppeteer.launch({ headless: false });
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
    await page.goto(this.link);
    await this.#login(page);
    await page.click('body'); // dismisses notifications popup

    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    const scrolls = 10;
    const scrollAmount = 500;
    const loadWaitTime = 1000;
    const uniqueDescriptions = new Set();
    for (let i = 0; i < scrolls; i++) {
      await page.evaluate((scrollAmount) => window.scrollBy(0, scrollAmount), scrollAmount);
      await new Promise(resolve => setTimeout(resolve, loadWaitTime));

      // Try to click on all the "see more" buttons
      await page.evaluate((selectors) => {
        const seeMoreButtons = document.querySelectorAll(selectors.seeMore);
        for (const button of seeMoreButtons) {
          if (button && button.innerText.trim().toLowerCase() === 'see more') {
            button.click();
          }
        }
    }, this.selectors);

      const descriptions = await page.evaluate(async (selectors) => {
        const posts = document.querySelectorAll(selectors.feed);
        const descriptions = [];
        console.log(posts)
        for (const post of posts) {
          const description = post.querySelector(selectors.description);
          if (description) {
            descriptions.push(description.innerText)
          }
        }
        return descriptions;
      }, this.selectors);

      for (const description of descriptions) {
        uniqueDescriptions.add(description)
      }
    }

    // TODO: This should be created with the constructor then hydrated somehow
    // basically need to extract that data-type conversion logic from the populateFromDOM listing method
    const listings = [];
    for (const description of uniqueDescriptions) {
      const fields = this.ollamaClient.extractInformation('all', description);
      const listing = new Listing();
    }
  }
}
