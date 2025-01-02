import { Datasource } from '../Datasource.js';
import { Listing } from '../Listing.js';
import { Logger } from '../../Logger.js';
import { OllamaClient } from '../llm/OllamaClient.js'
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
export class Frontenac extends Datasource {
  constructor() {
    super(
      'Frontenac Property Management',
      'https://cms.frontenacproperty.com/items/Listings',
    );
  }
  async fetchListings() {
    Logger.getInstance().info(`Fetching listings for ${this.datasource}`);
    let response = await fetch(this.link);
    response = await response.json();
    const listings = [];
    for (const property of response.data) {
      if (property?.availability.toLowerCase() !== 'available') {
        continue;
      }
      let description = '';
      const descriptionDOM = new JSDOM(property.description);
      const descriptionList = descriptionDOM.window.document.querySelector('ul');
      if (descriptionList) {
        const listElements = descriptionDOM.window.document.querySelectorAll('ul > li');
        for (const listElement of listElements) {
          description += `${listElement.textContent}\n`;
        }
      } else {
        description = descriptionDOM.window.document.body.textContent;
      }
      const listingObj = {
        address: property.title,
        description,
        beds: property.bedrooms,
        baths: property.bathrooms,
        leaseStartDate: property.date_available,
        totalPrice: property.price,
        link: `https://frontenacproperty.com/${property.slug}`,
        leaseType: 'Lease',
        landlord: 'Frontenac Property Management'
      }
      const listing = new Listing();
      listing.poplateFromObject(listingObj);
      listings.push(listing);
    }
    Logger.getInstance().info(`Fetched ${listings.length} listings`);
    return listings;
  }
}