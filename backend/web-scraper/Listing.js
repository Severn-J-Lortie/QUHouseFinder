import { createHash } from 'node:crypto';
import { Logger } from '../Logger.js'
import dateParser from 'any-date-parser';
export class Listing {
  constructor(fields) {
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
  #formatFields() {
    const numericProperties = ['totalPrice', 'pricePerBed', 'beds', 'baths'];

    for (const key in this) {
      let property = this[key];
      if (!property) {
        continue;
      }
      if (numericProperties.includes(key)) {
        if (typeof property === 'number') {
          continue;
        }
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
      } else if(typeof property === 'string') {
        property = property.trim().replace(/\n{2,}/g, '\n').replace(/\t+/g, '');
      }
      this[key] = property;
    }
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
      'baths',
      'datasource'
    ];
    const valuesToStore = [];
    for (const property of propertiesToStore) {
      valuesToStore.push(this[property]);
    }
    let queryString = '(';
    for (let i = 0; i < propertiesToStore.length; i++) {
      const property = propertiesToStore[i];
      if (valuesToStore[i] == null) {
        continue;
      }
      if (i === propertiesToStore.length - 1) {
        queryString += `${property}`;
      } else {
        queryString += `${property}, `;
      }
    }
    queryString += ') VALUES (';
    for (let i = 0; i < propertiesToStore.length; i++) {
      if (valuesToStore[i] == null) {
        continue;
      }
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
        this[key] = property;
      }
    }
    this.#formatFields();
    this.#computeHash();
    this.#setPricePerBed(this.totalPrice, this.beds);
  }
  poplateFromObject(obj) {
    for (const key in obj) {
      this[key] = obj[key]
    }
    this.#formatFields();
    this.#computeHash();
    this.#setPricePerBed();
  }
  #setPricePerBed() {
    if (this.totalPrice && this.beds) {
      this.pricePerBed = this.totalPrice / this.beds;
      if (this.pricePerBed <= 500) {
        this.pricePerBed = this.totalPrice;
      }
    }
  }
  #computeHash() {
    const keysToHash = [
      'address',
      'description',
      'landlord',
      'rentalType',
      'leaseStartDate',
      'beds',
      'baths',
      'totalPrice',
      'link',
      'datasource'
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