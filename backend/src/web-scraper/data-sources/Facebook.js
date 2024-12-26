import puppeteer from 'puppeteer';
import { Datasource } from '../Datasource.js';
import { Listing } from '../Listing.js'
import { OllamaClient } from '../llm/OllamaClient.js';
import { Logger } from '../../Logger.js';

export class Facebook extends Datasource {
  constructor() {
    const selectors = {
      loginUsername: '#login_popup_cta_form > div > div.xod5an3 > div > div > label > div > input',
      loginPassword: '#login_popup_cta_form > div > div:nth-child(4) > div > div > label > div > input',
      loginButton: '#login_popup_cta_form > div > div:nth-child(5) > div',
      feed: 'div[role=feed] > div',
      description: 'div[data-ad-rendering-role=story_message]',
      seeMore: 'div[role=button]',
      postLink: 'a:has(img)'
    }
    super(
      'Facebook',
      'https://www.facebook.com/groups/1618611005028802/?sorting_setting=CHRONOLOGICAL',
      selectors
    );
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
      await page.waitForSelector(this.selectors.loginUsername);
      await page.type(this.selectors.loginUsername, this.facebook_user);
      await page.type(this.selectors.loginPassword, this.facebook_pass);
      await page.click(this.selectors.loginButton);
      await page.waitForNavigation();
    }
  }
  async fetchListings() {
    Logger.getInstance().info(`Fetching listings for ${this.datasource}`);
    const browser = await puppeteer.launch({ headless: true });
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
    let descriptionsAndLinks = []
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

      await new Promise(resolve => setTimeout(resolve, loadWaitTime));
      const result = await page.evaluate(async (selectors) => {
        const posts = document.querySelectorAll(selectors.feed);
        const descriptionsAndLinks = [];
        for (const post of posts) {
          const description = post.querySelector(selectors.description);
          let link = post.querySelector(selectors.postLink)
          if (link) {
            link = link.href
          }
          if (description) {
            descriptionsAndLinks.push({description: description.innerText, link});
          }
        }
        return descriptionsAndLinks;
      }, this.selectors);
      descriptionsAndLinks = descriptionsAndLinks.concat(result);
    }

    const normalize = desc => {
      return desc.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    }
    const dedupedDescriptionsAndLinks = descriptionsAndLinks.filter((obj, index, self) =>
      index === self.findIndex(o => normalize(o.description) === normalize(obj.description))
    );
    Logger.getInstance().info(`Finished scraping ${dedupedDescriptionsAndLinks.length} listings`);

    Logger.getInstance().info(`Postprocessing...`);
    const listings = [];
    for (const entry of dedupedDescriptionsAndLinks) {
      try {
        const fields = await this.ollamaClient.extractInformation('all', entry.description);
        fields.description = entry.description;
        fields.link = entry.link;
        fields.landlord = 'Private landlord (Facebook)'
        fields.datasource = this.datasource;
        const listing = new Listing();
        listing.poplateFromObject(fields);
        listings.push(listing);
      } catch (e) {
        Logger.getInstance().err(`Failed to postprocess ${entry.address}: ${e.stack}`);
        continue;
      }
    }
    Logger.getInstance().info(`Postprocessing finished`);
    browser.close();
    return listings;
  }
}
