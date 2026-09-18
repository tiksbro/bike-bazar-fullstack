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
