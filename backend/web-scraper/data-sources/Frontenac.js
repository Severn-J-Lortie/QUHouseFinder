import { Datasource } from '../Datasource.js';
import { HFClient } from '../../llm/HFClient.js'
export class Frontenac extends Datasource {
  constructor() {
    const selectors = {
      _listingElements: 'div.property-listings div.col-sm-6.col-md-4:has(.ribbon-green)',
      _link: { selector: 'article > h4 > a', getProperty: el => el.href },
      address: 'div.titlewrap.clearfix',
      beds: 'span.bedrooms > b',
      baths: 'div.footer-left.pull-left span:nth-child(2) > b',
      totalPrice: 'span.property-price > b',
      description: { selector: 'ul.wp-block-list', getProperty: el => el.textContent.trim().replace('\n', ' ') },
      leaseStartDate: {
        selector: 'section.entry-content.single-content.clearfix > h4',
        getProperty: el => el.textContent.split(':')[1].trim()
      }
    }
    super(
      'Frontenac Property Management',
      'https://www.frontenacproperty.com/properties/stud-rentals/?sort=availability&order=ASC',
      selectors,
      {
        postprocess: async (listing) => {
          const hfClient = HFClient.getInstance();
          const response = await hfClient.extractInformation(['address'], listing.address);
          listing.address = response.address;
          return listing;
      }
    });
  }
}