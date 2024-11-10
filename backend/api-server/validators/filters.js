export function validateFields(fields) {
  if (typeof fields !== 'object' || !fields) {
    return { success: false, errorMessage: 'Fields is wrong type or not specified' };
  }

  const fieldsSchema = {
    columnKeys: ['value', 'matchMode'],
    requiredKeys: ['address', 'beds', 'priceperbed', 'rentaltype', 'leasestartdate'],
    address: { dataType: 'string' },
    beds: { dataType: 'number' },
    priceperbed: { dataType: 'number' },
    rentaltype: { dataType: 'string' },
    leasestartdate: { dataType: 'date' },
  };
  const allowableMatchModes = {
    string: ['contains', 'notContains', 'startsWith', 'endsWith', 'equals', 'notEquals'],
    number: ['equals', 'notEquals', 'lt', 'lte', 'gt', 'gte'],
    date: ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter'],
  };

  if (Object.keys(fields).length !== fieldsSchema.requiredKeys.length) {
    return { success: false, errorMessage: 'Invalid fields: incorrect number of columns' };
  }
  if (!fieldsSchema.requiredKeys.every(key => Object.keys(fields).includes(key))) {
    return { success: false, errorMessage: 'Invalid fields: incorrect columns' };
  }
  for (const key in fields) {
    const column = fields[key];
    if (Object.keys(column).length !== fieldsSchema.columnKeys.length) {
      return { success: false, errorMessage: `Invalid fields: column ${key} has incorrect number of fields` };
    }
    if (!fieldsSchema.columnKeys.every(k => Object.keys(column).includes(k))) {
      return { success: false, errorMessage: `Invalid fields: column ${key} has incorrect fields` };
    }
    const dataType = fieldsSchema[key].dataType;
    const matchModesForDataType = allowableMatchModes[dataType];
    if (!matchModesForDataType.includes(column.matchMode)) {
      return { success: false, errorMessage: `Invalid fields: column ${key} has invalid matchMode` };
    }
  }
  return { success: true };
}
