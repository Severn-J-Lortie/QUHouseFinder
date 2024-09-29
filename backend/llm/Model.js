export class Model {
  static MODEL = 'meta-llama/Meta-Llama-3.1-8B-Instruct';

  createPrompt(fields, content) {
    const fieldDescriptors = {
      leaseStartDate: 
`leaseStartDate: <lease start date>. The date field should be populated with a date 
of the form Month, Day, Year. E.g. September 1, 2024. If the listing is available "now" or
"immediately", then put "now" as the value of leaseStartDate`,
      rent: 'rent: <rent>',
      beds: 'beds: <number of beds>\n',
      rentalType: 'rentalType: <sublet/lease>\n',
      address: 'address: <number and street, e.g. 1-23 Princess St or A23 Toronto St>\n'
    }

    let fieldMessage = '';
    if (fields !== 'all') {
      for (const field of fields) {
        fieldMessage += fieldDescriptors[field];
      }
    } else {
      for (const field in fieldDescriptors) {
        fieldMessage += fieldDescriptors[field];
      }
    }

    const taskMessage =
`Your task is to extract specific details from the text the user provides. 
Respond only with the details in the exact format they specify, with no 
additional comments, explanations, or reasoning. If you can't find a 
specific detail, or if you are unsure, just use "null" for that field.
Required format is a JSON object with ONLY the following fields:
${fieldMessage}
The output must always be valid a valid JSON object (so just null is not
sufficient).`;
    const messages = [
      {
        role: 'system',
        content: taskMessage
      },
      {
        role: 'user',
        content
      }
    ]
    return messages;
  }
}