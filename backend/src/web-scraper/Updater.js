import { Frontenac } from './data-sources/Frontenac.js';
import { Heron } from './data-sources/Heron.js';
import { Panadew } from './data-sources/Panadew.js';
import { QueensCommunityHousing } from './data-sources/QueensCommunityHousing.js';
import { Facebook } from './data-sources/Facebook.js';
import { Axon } from './data-sources/Axon.js';
import { Logger } from '../Logger.js';

import { Database } from '../Database.js';

export class Updater {
  constructor() {
    this.datasources = [
      // new Frontenac(),
      // new Heron(),
      new Panadew(),
      // new QueensCommunityHousing(),
      // new Facebook(),
      // new Axon()
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
Stack: ${error.stack}`);
      }
    }

    for (const listing of listings) {
      const listingSQL = listing.toSQL();
      const queryString = `INSERT INTO ${this.tableName} ${listingSQL.queryString} ON CONFLICT (hash) DO UPDATE SET lastseen = CURRENT_DATE`;
      await db.query(queryString, listingSQL.values);
    }
    db.release();
  }
  async cleanupOldListings() {
    const db = await Database.getInstance().connect();
    const oldListings = await db.query("DELETE FROM listings WHERE lastseen < NOW() - INTERVAL '1 day' AND datasource != 'Facebook'");
    const oldListingsFacebook = await db.query("DELETE FROM listings WHERE lastseen < NOW() - INTERVAL '5 day' AND datasource = 'Facebook'");
    Logger.getInstance().info(`Cleaned ${oldListings.rowCount + oldListingsFacebook.rowCount} old listings`);
    db.release();
  }
}