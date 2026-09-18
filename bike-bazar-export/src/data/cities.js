export const citiesByProvince = {
  Koshi: ['Biratnagar', 'Dharan', 'Itahari', 'Birtamod', 'Damak', 'Ilam', 'Phidim', 'Triyuga', 'Inaruwa', 'Dhankuta'],
  Madhesh: ['Birgunj', 'Janakpur', 'Kalaiya', 'Lahan', 'Rajbiraj', 'Malangwa', 'Gaur'],
  Bagmati: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Bharatpur', 'Hetauda', 'Jitpur Simara', 'Madhyapur Thimi', 'Banepa', 'Kirtipur', 'Dhulikhel'],
  Gandaki: ['Pokhara', 'Damauli', 'Gorkha', 'Baglung', 'Besisahar'],
  Lumbini: ['Butwal', 'Nepalgunj', 'Ghorahi', 'Tulsipur', 'Siddharthanagar', 'Tansen', 'Kapilvastu'],
  Karnali: ['Birendranagar', 'Jumla', 'Dailekh'],
  Sudurpashchim: ['Dhangadhi', 'Bhimdatta', 'Tikapur', 'Dadeldhura', 'Baitadi'],
}

export const cities = Object.values(citiesByProvince).flat()
