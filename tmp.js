let x = `Lower level 1 bed, 1 bath modern apartment


Fully furnished including living, dining and bedroom furniture plus flat screen tv



Located downtown Kingston on the corner of Brock and Nelson



Open concept kitchen and living space



Kitchen with white cabinet, stone countertops, large window and eating area



Cozy living space!



Gorgeous bathroom. Ceramic tiled shower with glass door and modern grey vanity



Bedroom with double bed



Vinyl flooring throughout



Appliances included: fridge, stove and microwave



Shared laundry in basement of building



Heat and water included. Electricity is extra.



Parking available for an extra cost`;

x = x.trim().replace(/\n{2,}/g, '\n').replace(/\t+/g, '');
console.log(typeof x === 'string')