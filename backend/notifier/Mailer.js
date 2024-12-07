import nodemailer from 'nodemailer'
export class Mailer {

  constructor(db) {
    if (!(process.env['QU_GMAIL_USER'] && process.env['QU_GMAIL_PASS'])) {
      throw new Error('GMail username and password required. Set them in QU_GMAIL_USER and QU_GMAIL_PASS');
    }
    this.transporter = nodemailer.createTransport({
      'service': 'gmail',
      auth: {
        user: process.env['QU_GMAIL_USER'],
        pass: process.env['QU_GMAIL_PASS']
      }
    });
    this.db = db;
  }

  async send(userId, filterResults) {
    const userEmailQuery = await this.db.query('SELECT email FROM users WHERE id = $1', [userId]);
    const userEmail = userEmailQuery.rows[0];
    const mailOptions = {
      from: 'queenshousebot@gmail.com',
      to: userEmail,
      subject: 'New Listings Matching Your Filters',
    };
    let messageHtml = '';
    for (const filterId in filterResults) {
      messageHtml += `<h2>Listings from <a href="${`https://quhousefinder.com/?filter=${filterId}`}">this filter</a></h2>\n`;
      for (const listing of filterResults[filterId]) {
        if (listing.address) {
          const address = `<h3>${listing.address}</h3>\n`;
          messageHtml += address;
        }
        if (listing.priceperbed) {
          const rent = `<p>Rent (per person): \$${listing.priceperbed}</p>\n`;
          messageHtml += rent;
        }
        if (listing.beds) {
          const beds = `<p>Beds: ${listing.beds}</p>\n`;
          messageHtml += beds;
        }
      }
    }
    console.log(messageHtml);
  }

}