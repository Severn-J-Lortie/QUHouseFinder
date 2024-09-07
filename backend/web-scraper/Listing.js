import { createHash } from 'node:crypto';

export class Listing {
  constructor(data, dataType, selectors) {
    this.data = data;
    this.dataType = dataType;
    this.selectors = selectors;
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
    this.#populateFromData();
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
  #populateFromData() {
    const numericProperties = ['totalPrice', 'pricePerBed', 'beds', 'baths'];
    if (this.dataType === 'dom') {
      for (const key in this.selectors) {
        if (!key.startsWith('_')) {
          let selector;
          let getProperty;
          if (this.selectors[key] instanceof Object) {
            selector = this.selectors[key].selector;
            getProperty = this.selectors[key].getProperty;
          } else {
            selector = this.selectors[key];
          }
          const element = this.data.querySelector(selector);
          let property;
          if (getProperty) {
            property = getProperty(element);
          } else {
            property = element.textContent;
          }
          if (numericProperties.includes(key)) {
            property = property.replaceAll(/[^0-9.]/g, '');
            this[key] = Number(property);
          } else {
            this[key] = property.trim();
          }
        }
      }
    }

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

    this.pricePerBed = this.totalPrice / this.beds;
  }
}