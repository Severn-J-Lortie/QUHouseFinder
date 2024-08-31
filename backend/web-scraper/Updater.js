import { Frontenac } from './data-sources/Frontenac.js';
import { Heron } from './data-sources/Heron.js';
import { Panadew } from './data-sources/Panadew.js';
import { QueensCommunityHousing } from './data-sources/QueensCommunityHousing.js';

import { Database } from '../Database.js';

export class Updater {
  constructor() {
    this.datasources = [
      new Frontenac(),
      new Heron(),
      new Panadew(),
      new QueensCommunityHousing()
    ];
    this.tableName = 'listings';
  }
  async update() {
    let listings = [];
    for (const datasource of this.datasources) {
      const newListings = await datasource.fetchListings();
      listings = listings.concat(newListings);
    }
    for (const listing of listings) {
      const listingSQL = listing.toSQL();
      const queryString = `INSERT INTO ${this.tableName} ${listingSQL.queryString} ON CONFLICT (hash) DO NOTHING`;
      await Database.getInstance().query(queryString, listingSQL.values);
    }
  }
}