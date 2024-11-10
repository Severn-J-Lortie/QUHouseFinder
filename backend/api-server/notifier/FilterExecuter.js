import pg from 'pg';
const { Pool, types } = pg;

export class FilterExecuter {

  static #instance = null;
  constructor() {
    if (FilterExecuter.#instance) {
      throw new Error('Must call getInstance');
    }
    FilterExecuter.#instance = this;
  }
  static getInstance() {
    if (!FilterExecuter.#instance) {
      FilterExecuter.#instance = new Database();
    }
    return FilterExecuter.#instance;
  }

  #queryFromFilterFields(fields) {

    const leftSide = 'SELECT * FROM filters WHERE ';
    let rightSide = '';
  
    const fieldKeys = Object.keys(fields);
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
      rightSide += `${fieldKey} ${operator} ${operatorPrefix}${'$' + i}${operatorPostfix}`
      if (!lastItem) {
        rightSide += ` AND `
      }
    }
    return leftSide + rightSide;
  }

  async runFilters(filters) {
    
  }

}