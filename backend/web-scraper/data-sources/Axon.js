import { Datasource } from '../Datasource.js';
import fetch from 'node-fetch';

export class Axon extends Datasource {
  constructor() {
    const selectors = {
      _listingElements: 'div.jet-listing-grid__item',
      _link: { selector: 'a', getProperty: el => el.href },
      address: 'div.elementor-element-de1bbf1 h1',
      beds: 'div.elementor-element-655d0ed li:nth-child(1) > span.elementor-icon-list-text',
      baths: 'div.elementor-element-655d0ed li:nth-child(2) > span.elementor-icon-list-text',
      totalPrice: 'div.elementor-element-6d1a791 h3',
      leaseStartDate: { selector: 'div.elementor-element-62f7376 h3', getProperty: el => el.textContent.split(':')[1] },
      description: { selector: 'div.elementor-element-1eb96a3 div.elementor-widget-container *:not(style)', getProperty: el => el.textContent.trim().replaceAll('\n', ' ') }
    }
    super(  
      'Axon Property Management', 
      'https://axonproperties.ca/student-rentals-kingston/?nocache=1724697160',
      selectors,
      {
        fetch: async (link) => {
          const response = await fetch(link, {
            body: 'action=jet_engine_ajax&handler=get_listing&page_settings%5Bpost_id%5D=695&page_settings%5Bqueried_id%5D=695%7CWP_Post&page_settings%5Belement_id%5D=bf86c82&page_settings%5Bpage%5D=1&listing_type=elementor&isEditMode=false&addedPostCSS%5B%5D=553',
            method: 'POST',
            headers: {
              'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            }
          });
          return response;
        },
        afterFetch: async (response) => {
          const responseJSON = await response.json();
          return responseJSON.data.html;
        }
      }
    );
  }
}