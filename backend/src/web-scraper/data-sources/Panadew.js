import { Datasource } from '../Datasource.js';
export class Panadew extends Datasource {

  
  constructor() {
    const selectors = {
      _listingElements: { 
        selector: 'form div.four.columns.listingblockgrid.listingblock',
        filter: listing => !listing.querySelector('div:nth-child(1) > a > div > div')
      },
      _link: { selector: 'div > a', getProperty: el => el.href },
      address: '#title',
      leaseStartDate: {
        selector: '#tab0 > ul > li:nth-child(5)',
        getProperty: el => el.textContent.split(':')[1].trim()
      },
      beds: { selector: '#tab0 > ul > li:nth-child(3)', getProperty: el => el.textContent.split(':')[1].trim() },
      baths: { selector: '#tab0 > ul > li:nth-child(4)', getProperty: el => el.textContent.split(':')[1].trim() },
      totalPrice: 'span.featuresprice',
      description: { selector: 'div[itemprop="description"]', getProperty: el => el.textContent.trim().replace('\n', ' ')}
    }
    super(
      'Panadew Property Management', 
      'https://www.panadew.ca/property_type/student-rentals', 
      selectors
    );
  }
  async fetchListings() {
    let pageNumber = 1;
    let allListings = [];
    let pageListings = [];
    while (pageNumber < 2 || pageListings.length) {
      const link = `${this.link}/page/${pageNumber}`;
      pageListings = await super.fetchListings(link, pageNumber)
      allListings = allListings.concat(pageListings)
      pageNumber++;
    }
    return allListings;
  }
}