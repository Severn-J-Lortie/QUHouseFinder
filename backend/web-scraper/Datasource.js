import {JSDOM, VirtualConsole } from 'jsdom';
import fetch from 'node-fetch';

import { Listing } from './Listing.js'

export class Datasource {
  constructor(name, link, selectors, hooks) {
    this.name = name;
    this.link = link;
    this.selectors = selectors;
    this.hooks = hooks;
  }
  async fetchListings() {
    let response;
    let dom;
    let html;
    if (this.hooks?.fetch) {
      response = await this.hooks.fetch(this.link);
    } else {
      response = await fetch(this.link);
    }
    if (this.hooks?.afterFetch) {
      html = await this.hooks.afterFetch(response);
    } else {
      html = await response.text();
    }
    const virtualConsole = new VirtualConsole();
    const noopConsole = {
      error: () => {},
      warn: () => {},
      info: () => {},
      dir: () => {}
    }
    virtualConsole.sendTo(noopConsole);
    dom = new JSDOM(html, { url: this.link, virtualConsole });
    const listingElements = dom.window.document.querySelectorAll(this.selectors._listingElements);
    const listings = [];
    for (const listingElement of listingElements) {
      const detailsLinkElement = listingElement.querySelector(this.selectors._link.selector);
      const detailsLink = this.selectors._link.getProperty(detailsLinkElement);
      response = await fetch(detailsLink);
      html = await response.text();
      dom = new JSDOM(html, {url: detailsLink, virtualConsole});
      const listing = new Listing(dom.window.document, 'dom', this.selectors);
      listing.landlord = this.name;
      listing.link = detailsLink;
      if (!this.selectors.rentalType) {
        listing.rentalType = 'rental';
      }

      if (this.hooks?.postprocess) {
        const postprocessedListing = await this.hooks.postprocess(listing); 
        listings.push(postprocessedListing);
      } else {
        listings.push(listing);
      }
    }
    return listings;
  }
}