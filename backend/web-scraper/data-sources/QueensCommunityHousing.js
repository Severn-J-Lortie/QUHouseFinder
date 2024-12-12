import { Datasource } from '../Datasource.js';
import { OllamaClient } from '../llm/OllamaClient.js';
export class QueensCommunityHousing extends Datasource {
  constructor() {
    const removeCellLabel = el => el.textContent.split(':')[1].trim();
    const selectors = {
      _listingElements: 'tr',
      _link: { selector: 'td:nth-of-type(10) > a', getProperty: el => el.href },
      address: { 
        selector: '#search-listings > div > div:nth-child(2) > div:nth-child(3) > div:nth-child(2)',
        getProperty: removeCellLabel
      },
      leaseType: { 
        selector: '#search-listings > div > div:nth-child(2) > div:nth-child(3) > div:nth-child(5)',
        getProperty: removeCellLabel
      },
      beds: {
        selector: '#search-listings > div > div:nth-child(2) > div:nth-child(3) > div:nth-child(7)',
        getProperty: removeCellLabel
      },
      leaseStartDate: {
        selector:'#search-listings > div > div:nth-child(2) > div:nth-child(3) > div:nth-child(3)',
        getProperty: removeCellLabel
      },
      totalPrice: '#search-listings > div > div.row.px-4.mb-2 > div.col-md-2.text-end.lead > h2 > strong',
      description: {
        selector: '#search-listings > div > div:nth-child(2) > div:nth-child(4) > div.card.bg-light.text-dark.col-md-12 > div',
        getProperty: el => el.textContent.trim().replaceAll('\n', ' ')
      }
    }
    super(
      "Queen's Community Housing", 
      'https://listingservice.housing.queensu.ca/public/getByFilter?show_test=0&num_items=1000', 
      selectors,
      {
        afterFetch: async (response) => {
          const json = await response.json();
          const html = json[0];
          const fullTableHtml = `
          <table>
            <tbody>
              ${html}
            </tbody>
          </table>
          `;
          return fullTableHtml;
        },
        postprocess: async (listing) => {
          const formattedLeaseType = listing.leaseType.toLowerCase();
          if (!(formattedLeaseType.includes('lease') || formattedLeaseType.includes('sublet'))) {
            if (listing.description) {
              const ollamaClient = OllamaClient.getInstance();
              const leaseType = (await ollamaClient.extractInformation(['leaseType'], listing.description)).leaseType;
              console.log(leaseType)
              listing.leaseType = leaseType;
            }
          }
          return listing;
        }
      }
    );
  }
}