import { Datasource } from '../Datasource.js';
export class Panadew extends Datasource {
  constructor() {
    const selectors = {
      _links: '.featured-listing',
      address: { selector: '.title', getProperty: el => el.textContent.split('\n')[1] },
      leaseStartDate: {
        selector: '.unit-detail__available-date.text--muted',
        getProperty: el => el.textContent.trim().split(' ')[1]
      },
      beds: '.unit-detail__unit-info > li',
      baths: '.unit-detail__unit-info > li:nth-child(2)',
      totalPrice: '.unit-detail__price.accent-color.title--small',
      description: '.unit-detail__description'
    }
    super(
      'Panadew Property Management', 
      'https://panadew.managebuilding.com/Resident/public/rentals', 
      selectors
    );
  }
}