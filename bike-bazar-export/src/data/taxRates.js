// NOTE: All figures below are illustrative estimates for demo purposes only.
// They do not represent official Government of Nepal tax rates.

export const provinces = [
  'Koshi',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim',
]

export const ccBands = [
  'Upto 125cc',
  '125-160cc',
  '160-250cc',
  '250-400cc',
  '400cc & Above',
]

export const brands = [
  {
    name: 'Yamaha',
    models: [
      { name: 'Fascino', engineCc: 125 },
      { name: 'FZS V3', engineCc: 149 },
      { name: 'R15 V3', engineCc: 155 },
    ],
  },
  {
    name: 'Honda',
    models: [
      { name: 'Dio', engineCc: 110 },
      { name: 'CB Shine', engineCc: 125 },
      { name: 'Shine SP', engineCc: 125 },
    ],
  },
  {
    name: 'Bajaj',
    models: [
      { name: 'Pulsar 150', engineCc: 150 },
      { name: 'Pulsar NS200', engineCc: 200 },
    ],
  },
  {
    name: 'TVS',
    models: [
      { name: 'Ntorq 125', engineCc: 125 },
      { name: 'Apache RTR 160', engineCc: 160 },
    ],
  },
  {
    name: 'Royal Enfield',
    models: [
      { name: 'Classic 350', engineCc: 350 },
      { name: 'Bullet 350', engineCc: 350 },
    ],
  },
  {
    name: 'KTM',
    models: [
      { name: 'Duke 200', engineCc: 200 },
      { name: 'RC 200', engineCc: 200 },
    ],
  },
  {
    name: 'Hero',
    models: [
      { name: 'Xpulse 200', engineCc: 200 },
    ],
  },
  {
    name: 'Suzuki',
    models: [
      { name: 'Access 125', engineCc: 125 },
      { name: 'Gixxer SF', engineCc: 155 },
    ],
  },
]

// Yearly tax amount in Rs., keyed by [province][ccBand].
// Illustrative estimates only — not official rates.
export const taxRates = {
  Koshi: {
    'Upto 125cc': 3000,
    '125-160cc': 4500,
    '160-250cc': 6500,
    '250-400cc': 9500,
    '400cc & Above': 14000,
  },
  Madhesh: {
    'Upto 125cc': 2800,
    '125-160cc': 4200,
    '160-250cc': 6000,
    '250-400cc': 9000,
    '400cc & Above': 13000,
  },
  Bagmati: {
    'Upto 125cc': 3500,
    '125-160cc': 5200,
    '160-250cc': 7500,
    '250-400cc': 11000,
    '400cc & Above': 16000,
  },
  Gandaki: {
    'Upto 125cc': 3200,
    '125-160cc': 4800,
    '160-250cc': 7000,
    '250-400cc': 10000,
    '400cc & Above': 14500,
  },
  Lumbini: {
    'Upto 125cc': 3000,
    '125-160cc': 4500,
    '160-250cc': 6500,
    '250-400cc': 9500,
    '400cc & Above': 13500,
  },
  Karnali: {
    'Upto 125cc': 2500,
    '125-160cc': 3800,
    '160-250cc': 5500,
    '250-400cc': 8000,
    '400cc & Above': 12000,
  },
  Sudurpashchim: {
    'Upto 125cc': 2600,
    '125-160cc': 4000,
    '160-250cc': 5800,
    '250-400cc': 8500,
    '400cc & Above': 12500,
  },
}

// ---------------------------------------------------------------------
// CARS (added in Car Plan Phase 7)
// ---------------------------------------------------------------------
// Cars are taxed in two different ways:
//   - Petrol, Diesel and Hybrid cars: by engine size (cc), like bikes.
//   - Electric cars: they have no engine cc, so by motor power (kW).
// The numbers follow the general shape of the real Bagmati car tax
// table, and the other provinces are scaled from it. They are still
// estimates for this demo — not official Government of Nepal rates.

// Engine size groups for Petrol / Diesel / Hybrid cars, smallest first.
export const carCcBands = [
  'Upto 1000cc',
  '1001-1500cc',
  '1501-2000cc',
  '2001-2500cc',
  '2501-3000cc',
  '3001-3500cc',
  'Above 3500cc',
]

// Motor power groups for Electric cars, smallest first.
export const carPowerBands = [
  'Upto 50 kW',
  '51-125 kW',
  '126-200 kW',
  'Above 200 kW',
]

// Yearly tax in Rs. for Petrol / Diesel / Hybrid cars,
// keyed by [province][carCcBand]. Estimates only.
export const carTaxRates = {
  Koshi: {
    'Upto 1000cc': 19500,
    '1001-1500cc': 22000,
    '1501-2000cc': 24000,
    '2001-2500cc': 32500,
    '2501-3000cc': 44000,
    '3001-3500cc': 53000,
    'Above 3500cc': 61500,
  },
  Madhesh: {
    'Upto 1000cc': 18000,
    '1001-1500cc': 20500,
    '1501-2000cc': 22000,
    '2001-2500cc': 30500,
    '2501-3000cc': 41000,
    '3001-3500cc': 49000,
    'Above 3500cc': 57500,
  },
  Bagmati: {
    'Upto 1000cc': 22000,
    '1001-1500cc': 25000,
    '1501-2000cc': 27000,
    '2001-2500cc': 37000,
    '2501-3000cc': 50000,
    '3001-3500cc': 60000,
    'Above 3500cc': 70000,
  },
  Gandaki: {
    'Upto 1000cc': 20000,
    '1001-1500cc': 23000,
    '1501-2000cc': 25000,
    '2001-2500cc': 34000,
    '2501-3000cc': 46000,
    '3001-3500cc': 55000,
    'Above 3500cc': 64500,
  },
  Lumbini: {
    'Upto 1000cc': 19500,
    '1001-1500cc': 22000,
    '1501-2000cc': 24000,
    '2001-2500cc': 32500,
    '2501-3000cc': 44000,
    '3001-3500cc': 53000,
    'Above 3500cc': 61500,
  },
  Karnali: {
    'Upto 1000cc': 16500,
    '1001-1500cc': 19000,
    '1501-2000cc': 20000,
    '2001-2500cc': 28000,
    '2501-3000cc': 37500,
    '3001-3500cc': 45000,
    'Above 3500cc': 52500,
  },
  Sudurpashchim: {
    'Upto 1000cc': 17000,
    '1001-1500cc': 19500,
    '1501-2000cc': 21000,
    '2001-2500cc': 29000,
    '2501-3000cc': 39000,
    '3001-3500cc': 47000,
    'Above 3500cc': 54500,
  },
}

// Yearly tax in Rs. for Electric cars,
// keyed by [province][carPowerBand]. Estimates only.
export const carEvTaxRates = {
  Koshi: {
    'Upto 50 kW': 4500,
    '51-125 kW': 13000,
    '126-200 kW': 17500,
    'Above 200 kW': 26500,
  },
  Madhesh: {
    'Upto 50 kW': 4000,
    '51-125 kW': 12500,
    '126-200 kW': 16500,
    'Above 200 kW': 24500,
  },
  Bagmati: {
    'Upto 50 kW': 5000,
    '51-125 kW': 15000,
    '126-200 kW': 20000,
    'Above 200 kW': 30000,
  },
  Gandaki: {
    'Upto 50 kW': 4500,
    '51-125 kW': 14000,
    '126-200 kW': 18500,
    'Above 200 kW': 27500,
  },
  Lumbini: {
    'Upto 50 kW': 4500,
    '51-125 kW': 13000,
    '126-200 kW': 17500,
    'Above 200 kW': 26500,
  },
  Karnali: {
    'Upto 50 kW': 4000,
    '51-125 kW': 11000,
    '126-200 kW': 15000,
    'Above 200 kW': 22500,
  },
  Sudurpashchim: {
    'Upto 50 kW': 4000,
    '51-125 kW': 11500,
    '126-200 kW': 15500,
    'Above 200 kW': 23500,
  },
}
