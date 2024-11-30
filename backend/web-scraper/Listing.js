import { createHash } from 'node:crypto';
import { Logger } from '../Logger.js'
import dateParser from 'any-date-parser';
export class Listing {
  constructor() {
    this.hash = null;
    this.address = null;
    this.landlord = null;
    this.link = null;
    this.rentalType = null;
    this.leaseStartDate = null;
    this.description = null;
    this.totalPrice = null;
    this.pricePerBed = null;
    this.beds = null;
    this.baths = null;
  }
  toSQL() {
    const propertiesToStore = [
      'hash',
      'address',
      'landlord',
      'link',
      'rentalType',
      'leaseStartDate',
      'description',
      'totalPrice',
      'pricePerBed',
      'beds',
      'baths'
    ];
    const valuesToStore = [];
    for (const property of propertiesToStore) {
      if (!(property instanceof Boolean) && !property) {

      }
      valuesToStore.push(this[property]);
    }
    let queryString = '(';
    for (let i = 0; i < propertiesToStore.length; i++) {
      const property = propertiesToStore[i];
      if (i === propertiesToStore.length - 1) {
        queryString += `${property}`;
      } else {
        queryString += `${property}, `;
      }
    }
    queryString += ') VALUES (';
    for (let i = 0; i < propertiesToStore.length; i++) {
      if (i === propertiesToStore.length - 1) {
        queryString += `$${i + 1}`;
      } else {
        queryString += `$${i + 1}, `;
      }
    }
    queryString += ')';
    return { queryString, values: valuesToStore };
  }
  populateFromDOMElement(domElement, selectors) {
    const numericProperties = ['totalPrice', 'pricePerBed', 'beds', 'baths'];

    for (const key in selectors) {
      if (!key.startsWith('_')) {
        let selector;
        let getProperty;
        if (selectors[key] instanceof Object) {
          selector = selectors[key].selector;
          getProperty = selectors[key].getProperty;
        } else {
          selector = selectors[key];
        }
        const element = domElement.querySelector(selector);
        if (!element) {
          continue;
        }
        let property;
        if (getProperty) {
          property = getProperty(element);
        } else {
          property = element.textContent;
        }
        if (numericProperties.includes(key)) {
          property = property.replaceAll(/[^0-9.]/g, '');
          property = Number(property);
          // If numeric properties are falsey (0 included since beds, baths, rent, etc... are not going to be 0)
          // then we were unable to find them. Mark as null.
          if (!property) {
            property = null;
          }
        } else if (key === 'leaseStartDate') {
          // TODO: Check against larger list of words for "right now"
          if (property.toLowerCase().trim() === 'immediate') {
            property = 'now';
          }
          let date;
          date = dateParser.fromString(property)
          if (date.invalid) {
            property = null;
            Logger.getInstance().err(`Couldn't convert "${property}" to Date`);
          } else {
            property = date.toISOString().split('T')[0];
          }
        } else {
          property = property.trim().replace(/\n{2,}/g, '\n');
        }
        this[key] = property;
      }
    }
    this.computeHash();
    this.setPricePerBed(this.totalPrice, this.beds);
  }
  setPricePerBed(price, beds) {
    if (this.totalPrice && this.beds) {
      this.pricePerBed = price / beds;
      if (this.pricePerBed <= 500) {
        this.pricePerBed = price;
      }
    }
  }
  computeHash() {
    const keysToHash = [
      'address',
      'description',
      'landlord',
      'rentalType',
      'leaseStartDate',
      'beds',
      'baths',
      'totalPrice',
      'link'
    ];
    let hashString = '';
    for (const key of keysToHash) {
      if (!this[key]) {
        continue;
      }
      const formatted = String(this[key]).toLowerCase().replaceAll(' ', '').replaceAll('\n', '');
      hashString += formatted;
    }
    const hash = createHash('sha256');
    this.hash = hash.update(hashString).digest('hex');
  }
}