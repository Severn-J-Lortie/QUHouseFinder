import { JSDOM, VirtualConsole } from 'jsdom';
import fetch from 'node-fetch';

import { Listing } from './Listing.js'
import { Logger } from '../Logger.js'

export class Datasource {
  constructor(name, link, selectors, hooks) {
    this.datasource = name;
    this.link = link;
    this.selectors = selectors;
    this.hooks = hooks;
  }
  async fetchListings(pageLink, pageNumber) {
    Logger.getInstance().info(`Fetching listings for ${this.datasource}${pageNumber ? ', page ' + pageNumber : ''}`);
    const link = pageLink ?? this.link;
    let response;
    let dom;
    let html;
    if (this.hooks?.fetch) {
      response = await this.hooks.fetch(link);
    } else {
      response = await fetch(link);
    }
    if (this.hooks?.afterFetch) {
      html = await this.hooks.afterFetch(response);
    } else {
      html = await response.text();
    }
    const virtualConsole = new VirtualConsole();
    const noopConsole = {
      error: () => { },
      warn: () => { },
      info: () => { },
      dir: () => { }
    }
    virtualConsole.sendTo(noopConsole);
    dom = new JSDOM(html, { url: link, virtualConsole });
    let listingElements = [];
    if (this.selectors._listingElements instanceof Object) {
      const allListingElements = dom.window.document.querySelectorAll(this.selectors._listingElements.selector);
      for (const listingElement of allListingElements) {
        if (this.selectors._listingElements.filter(listingElement)) {
          listingElements.push(listingElement);
        }
      }
    } else {
      listingElements = dom.window.document.querySelectorAll(this.selectors._listingElements);
    }

    const listings = [];
    for (let i = 0; i < listingElements.length; i++) {
      Logger.getInstance().info(`Grabbing details for listing ${i + 1}/${listingElements.length}`);
      const listingElement = listingElements[i];
      const detailsLinkElement = listingElement.querySelector(this.selectors._link.selector);
      const detailsLink = this.selectors._link.getProperty(detailsLinkElement);
      response = await fetch(detailsLink);
      html = await response.text();
      dom = new JSDOM(html, { url: detailsLink, virtualConsole });
      const listing = new Listing();
      listing.populateFromDOMElement(dom.window.document, this.selectors)
      listing.landlord = this.datasource;
      listing.datasource = this.datasource;
      listing.link = detailsLink;
      if (!this.selectors.leaseType) {
        listing.leaseType = 'Lease';
      }

      let finalListing;
      if (this.hooks?.postprocess) {
        Logger.getInstance().info(`Postprocessing for listing ${i + 1}/${listingElements.length}`);
        try {
          finalListing = await this.hooks.postprocess(listing);
        } catch (error) {
          Logger.getInstance().err(`Postprocessing failed for listing ${i + 1}. ${error.stack}`);
          finalListing = listing;
        }
      } else {
        finalListing = listing;
      }
      listings.push(finalListing);
    }
    return listings;
  }
}