import { Frontenac } from './data-sources/Frontenac.js';
import { Heron } from './data-sources/Heron.js';
import { Panadew } from './data-sources/Panadew.js';
import { QueensCommunityHousing } from './data-sources/QueensCommunityHousing.js';
import { Logger } from '../Logger.js'

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
    const db = await Database.getInstance().connect();
    let listings = [];
    for (const datasource of this.datasources) {
      try {
        const newListings = await datasource.fetchListings();
        listings = listings.concat(newListings);
      } catch (error) {
        Logger.getInstance().info(
`Error while fetching listings for ${datasource.name}: ${error.message}.
Stack: ${erorr.stack}`);
      }
    }
    for (const listing of listings) {
      const listingSQL = listing.toSQL();
      const queryString = `INSERT INTO ${this.tableName} ${listingSQL.queryString} ON CONFLICT (hash) DO NOTHING`;
      await db.query(queryString, listingSQL.values);
    }
    db.release();
  }
}