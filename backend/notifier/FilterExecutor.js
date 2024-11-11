export class FilterExecutor {

  static #instance = null;
  #db = null;
  constructor(db) {
    if (FilterExecutor.#instance) {
      throw new Error('Already constructed, call getInstance');
    }
    this.#db = db;
    FilterExecutor.#instance = this;
  }
  static getInstance() {
    if (!FilterExecutor.#instance) {
      throw new Error('Not constructed yet')
    }
    return FilterExecutor.#instance;
  }

  #queryFromFilterFields(fields) {
    const leftSide = 'SELECT * FROM listings WHERE ';
    let rightSide = '';
  
    let firstClause = true;
    let fieldKeys = Object.keys(fields);
    fieldKeys = fieldKeys.filter(key => !!fields[key].value)
    const values = [];
    for (let i = 0; i < fieldKeys.length; i++) {
      const field = fields[fieldKeys[i]];
      const fieldKey = fieldKeys[i];
      let operator = '', operatorPrefix = '', operatorPostfix = '';
      switch (field.matchMode) {
        case 'contains':
          operator = 'LIKE';
          operatorPrefix = '%';
          operatorPostfix = '%';
          break;
        case 'notContains':
          operator = 'NOT LIKE';
          operatorPrefix = '%';
          operatorPostfix = '%';
          break;
        case 'startsWith':
          operator = 'LIKE';
          operatorPrefix = '%';
          break;
        case 'endsWith':
          operator = 'LIKE';
          operatorPostfix = '%';
          break;
        case 'dateIs':
        case 'equals':
          operator = '=';
          break;
        case 'dateIsNot':
        case 'notEquals':
          operator = '!=';
          break;
        case 'dateBefore':
        case 'lt':
          operator = '<';
          break;
        case 'lte':
          operator = '<=';
          break;
        case 'dateAfter':
        case 'gt':
          operator = '>';
          break;
        case 'gte':
          operator = '>=';
          break;
      }
      if (firstClause) {
        firstClause = false;
      } else {
        rightSide += ' AND ';
      }
      values.push(`${operatorPrefix}${field.value}${operatorPostfix}`);
      rightSide += `${fieldKey} ${operator} ${'$' + (i+1)}`
    }
    return {query: leftSide + rightSide, values};
  }

  async runFilters() {
    const newFiltersUserMap = {};
    const filters = await this.#db.query('SELECT * FROM filters');
    for (const filter of filters.rows) {
      const { query: filterQuery , values: filterValues }= this.#queryFromFilterFields(filter.fields);
      console.log(filterQuery, filterValues)
      let matchingListings = (await this.#db.query(filterQuery, filterValues)).rows;
      const matchingListingsHashes = matchingListings.map(listing => listing.hash);
      const newListings = matchingListings.filter(listing => !filter.previousmatches.includes(listing.hash));
      newFiltersUserMap[filter.userid] = newListings;
      await this.#db.query('UPDATE filters SET previousmatches = $1 WHERE id = $2', [matchingListingsHashes, filter.id])
    }
    return newFiltersUserMap;
  }

}