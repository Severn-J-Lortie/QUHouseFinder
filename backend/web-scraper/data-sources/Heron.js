import { Datasource } from '../Datasource.js';
import { OllamaClient } from '../llm/OllamaClient.js';
import dateParser from 'any-date-parser';
export class Heron extends Datasource {
  constructor() {
    const selectors = {
      _listingElements: 'div.property-box',
      _link: { selector: '[title="Address"]', getProperty: el => el.href },
      address: 'body > div:nth-child(2) > section.main-container.container > div > div.t-sec.clearfix > div.col-md-8.right-sec > div:nth-child(1) > div > div.t-sec.clearfix > div.left-sec.col-md-12 > ul > li:nth-child(1) > div',
      beds: {
        selector: 'body > div:nth-child(2) > section.main-container.container > div > div.t-sec.clearfix > div.col-md-4.left-sec > div.highlight-container > div:nth-child(2) > div.value',
        getProperty: el => el.textContent.toLowerCase().trim() === 'bachelor' ? '1' : el.textContent
      },
      baths: 'body > div:nth-child(2) > section.main-container.container > div > div.t-sec.clearfix > div.col-md-4.left-sec > div.highlight-container > div:nth-child(3) > div.value',
      totalPrice: 'div.price',
      description: {
        selector: 'body > div:nth-child(2) > section.main-container.container > div > div.t-sec.clearfix > div.col-md-8.right-sec > div:nth-child(1) > div > div:nth-child(2)',
        getProperty: el => el.textContent.trim().replace('\n', ' ')
      }
    }
    super('Heron Management', 'https://mipprental.com/C00185', selectors, {
      postprocess: async (listing) => {
        const ollamaClient = OllamaClient.getInstance();
        const response = await ollamaClient.extractInformation(['leaseStartDate'], listing.description);
        const date = dateParser.fromString(response.leaseStartDate);
        if (date.invalid) {
          listing.leaseStartDate = null;
        } else {
          listing.leaseStartDate = date.toISOString().split('T')[0];
        }
        return listing;
      }
    });
  }
}