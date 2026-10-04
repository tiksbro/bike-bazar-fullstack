import { SITE } from '../config/site'

// The words of the three legal pages: Terms of Use, Privacy Policy and Listing Rules.
// Each page is { title, intro, sections }, and each section is
// { id, heading, paragraphs, bullets }. The LegalPage component turns this into a page.
//
// Keeping the text here (not inside the JSX) means you can change the wording
// without touching any layout code.
//
// IMPORTANT: this is a starting draft, written in plain English. It is not legal advice.
// Before real launch, ask a lawyer in Nepal to check it against Nepali law.

const name = SITE.name
const email = SITE.contactEmail

export const termsOfUse = {
  title: 'Terms of Use',
  intro: `These terms are the rules for using ${name}. By creating an account or using the site, you agree to them. Please read them carefully.`,
  sections: [
    {
      id: 'about',
      heading: '1. What we are',
      paragraphs: [
        `${name} is an online marketplace where people and dealers in Nepal can list bikes, scooters and cars for sale, and where buyers can find them.`,
        `We do not own, inspect or sell the vehicles listed on the site. The sale is always between the buyer and the seller. We are not a party to that sale, and we do not hold or pass on payment for vehicles.`,
      ],
    },
    {
      id: 'who-can-use',
      heading: '2. Who can use the site',
      paragraphs: [
        'You must be at least 18 years old and able to make a legal agreement to create an account.',
        'If you register as a dealer, you confirm that you are allowed to act for that business and that the business details you give are true.',
      ],
    },
    {
      id: 'account',
      heading: '3. Your account',
      bullets: [
        'Give true and up-to-date information.',
        'Keep your password secret. You are responsible for everything done with your account.',
        'Tell us straight away if you think someone else is using your account.',
        'One person should not create several accounts to get around a limit or a ban.',
      ],
    },
    {
      id: 'selling',
      heading: '4. Listing a vehicle',
      paragraphs: [
        'Every listing must follow our Listing Rules. In short: you must own the vehicle or be allowed to sell it, the details and photos must be true, and the vehicle must be legal to sell in Nepal.',
        'Free dealer accounts can have a limited number of active listings at the same time. The current limit is shown in your dashboard.',
        'We may hide, change the category of, or remove any listing that breaks these terms or the Listing Rules.',
      ],
    },
    {
      id: 'buying',
      heading: '5. Buying a vehicle',
      paragraphs: [
        'Always see the vehicle and its documents (such as the bluebook) yourself before you pay. Check that the seller is the real owner, or is allowed to sell it.',
        'Tools on the site, such as the price insight, the Health Score, the tax calculator and the EMI calculator, give estimates only. They are not a promise about a vehicle\'s condition, value, tax or loan terms.',
      ],
    },
    {
      id: 'offers-ratings',
      heading: '6. Offers and ratings',
      paragraphs: [
        'Making or accepting an offer on the site shows that both sides want to go ahead. The actual sale, payment and ownership transfer happen between the buyer and seller, outside the site.',
        'Ratings and comments must be honest and based on a real deal. We may remove ratings that are fake, abusive or unrelated to the deal.',
      ],
    },
    {
      id: 'paid-features',
      heading: '7. Paid features',
      paragraphs: [
        'Some features, such as boosting a listing or a Dealer Pro plan, may cost money. The price and what you get will always be shown clearly before you pay. Any refund rules will be shown at that time too.',
      ],
    },
    {
      id: 'not-allowed',
      heading: '8. What is not allowed',
      bullets: [
        'Fraud, scams, or asking for money in advance for a vehicle the buyer has not seen.',
        'Listing stolen vehicles, or vehicles without legal papers.',
        'Fake, misleading or duplicate listings.',
        'Spam, harassment, hate speech or offensive content.',
        'Copying data from the site with bots or scripts, or trying to break or hack the site.',
      ],
    },
    {
      id: 'your-content',
      heading: '9. Photos and text you upload',
      paragraphs: [
        'You keep ownership of the photos and text you upload. You give us permission to show them on the site and to use them to promote your listing while it is live.',
        'You must have the right to use every photo you upload. Only upload photos of the actual vehicle.',
      ],
    },
    {
      id: 'our-role',
      heading: '10. Our responsibility',
      paragraphs: [
        'We work hard to keep the site safe and working, but we provide it "as is". We cannot promise that every listing or user is genuine, or that the site will always be available.',
        'As far as the law allows, we are not responsible for the condition of a vehicle, for what users say or do, or for any deal or payment between users.',
      ],
    },
    {
      id: 'suspension',
      heading: '11. Suspending accounts',
      paragraphs: [
        'If you break these terms, we may remove your listings, limit your account or close it. Where possible, we will tell you why.',
      ],
    },
    {
      id: 'changes',
      heading: '12. Changes to these terms',
      paragraphs: [
        'We may update these terms from time to time. The date at the top of this page shows the last change. If you keep using the site after a change, you accept the new terms. For big changes, we will try to tell you first.',
      ],
    },
    {
      id: 'law',
      heading: '13. Which law applies',
      paragraphs: [
        `These terms are governed by the laws of Nepal. If you have a problem, please contact us first at ${email} so we can try to solve it. If we cannot, the dispute will be handled by the courts of Nepal.`,
      ],
    },
    {
      id: 'contact',
      heading: '14. Contact us',
      paragraphs: [`${name}, ${SITE.location}. Email: ${email}`],
    },
  ],
}

export const privacyPolicy = {
  title: 'Privacy Policy',
  intro: `This page explains what information ${name} collects, why we collect it, who can see it, and what you can do about it. We follow Nepal's Individual Privacy Act, 2075 (2018).`,
  sections: [
    {
      id: 'what-we-collect',
      heading: '1. What we collect',
      bullets: [
        'Account details: your name, email address and password. Your password is stored in a scrambled (hashed) form, so we cannot read it.',
        'Dealer details, if you register as a dealer: business name, city and the brands you sell.',
        'Listings: vehicle details, price, city and the photos you upload.',
        'Activity on the site: your favourites, compare list, offers and their messages, ratings and comments, and reports you send.',
        'Technical details: when you log in, a login token is saved in your browser so you stay signed in. Our hosting provider may also keep basic logs, such as your IP address, to keep the site running and safe.',
      ],
      paragraphs: [
        'We do not collect card or bank details on the site.',
      ],
    },
    {
      id: 'why',
      heading: '2. Why we use it',
      bullets: [
        'To create and run your account.',
        'To show listings and let buyers contact sellers.',
        'To handle offers, ratings and reports.',
        'To keep the site safe: to find fake listings, scams and misuse.',
        'To understand how the site is used, so we can improve it.',
        'To follow the law, if we are legally required to share information.',
      ],
    },
    {
      id: 'who-sees-what',
      heading: '3. Who can see your information',
      bullets: [
        'Everyone can see your listings, including photos, price and city, and the seller name (or dealer business name) on them.',
        'Logged-in users can see a seller\'s email address on a listing, so they can contact the seller about it.',
        'Your average seller rating and rating comments are public.',
        'Offers and their messages are seen only by the buyer and the seller of that offer.',
        'When you report a listing, the seller is not told who reported it.',
        'Our team can see account and listing information when needed to run and protect the site.',
      ],
    },
    {
      id: 'service-providers',
      heading: '4. Companies that help us',
      paragraphs: [
        'We use trusted service providers to run the site: MongoDB Atlas stores our database, Cloudinary stores listing photos, and a hosting company runs the website. They only use your information to provide their service to us. Some of them store data on servers outside Nepal.',
        'We do not sell your personal information to anyone.',
      ],
    },
    {
      id: 'how-long',
      heading: '5. How long we keep it',
      paragraphs: [
        'We keep your information while your account is open. When you delete a listing, we remove it and its photos. When an account is closed, we delete or anonymise its information, except what we must keep for legal reasons or to deal with fraud.',
      ],
    },
    {
      id: 'your-rights',
      heading: '6. Your choices and rights',
      bullets: [
        'See and correct your details on your Profile page.',
        `Ask for a copy of your information, or ask us to delete your account, by emailing ${email}.`,
        'Delete your own listings at any time from your Dashboard.',
      ],
    },
    {
      id: 'security',
      heading: '7. Keeping your information safe',
      paragraphs: [
        'We protect your information with steps such as hashed passwords and secure (HTTPS) connections. No system is 100% safe, so please use a strong password that you do not use on other sites.',
      ],
    },
    {
      id: 'children',
      heading: '8. Children',
      paragraphs: [
        'The site is not meant for people under 18, and we do not knowingly collect information from them.',
      ],
    },
    {
      id: 'changes',
      heading: '9. Changes to this policy',
      paragraphs: [
        'If we change this policy, we will update the date at the top of this page. For big changes, we will try to tell you first.',
      ],
    },
    {
      id: 'contact',
      heading: '10. Contact us',
      paragraphs: [`Questions about your privacy? Email ${email}. ${name}, ${SITE.location}.`],
    },
  ],
}

export const listingRules = {
  title: 'Listing Rules',
  intro: `These rules keep ${name} safe and useful for everyone. Every listing must follow them. Listings that break them may be removed without notice.`,
  sections: [
    {
      id: 'what-you-can-list',
      heading: '1. What you can list',
      bullets: [
        'Motorcycles, scooters and cars (hatchback, sedan, SUV, MUV and pickup) located in Nepal.',
        'Only vehicles you own, or that you are allowed to sell (for example, as a dealer).',
        'Only vehicles that are legal to sell, with valid registration papers (bluebook).',
      ],
    },
    {
      id: 'be-honest',
      heading: '2. Be honest',
      bullets: [
        'Use real photos of the actual vehicle. No stock photos, and no photos taken from other websites.',
        'Give the true year, kilometres driven, engine size, fuel type and city.',
        'Tell buyers about any major accident, flood damage or engine work.',
        'Say if any yearly vehicle tax is still due.',
        'Show the real price you will accept. No fake low prices to get attention.',
      ],
    },
    {
      id: 'keep-it-clean',
      heading: '3. Keep listings clean',
      bullets: [
        'One listing per vehicle. Do not post the same vehicle again and again.',
        'Do not put phone numbers, website links or advertisements inside photos.',
        'No rude, offensive or unrelated content.',
        'Mark your listing as Sold, or delete it, as soon as the vehicle is sold.',
      ],
    },
    {
      id: 'not-allowed',
      heading: '4. Not allowed',
      bullets: [
        'Stolen vehicles, or vehicles with fake or missing papers.',
        'Spare parts, accessories, rentals or services (this site is for selling whole vehicles only).',
        'Asking buyers to pay a deposit before they have seen the vehicle.',
        'Listings made to collect people\'s contact details, or to send them to another site.',
      ],
    },
    {
      id: 'what-happens',
      heading: '5. What happens if a rule is broken',
      paragraphs: [
        'We may remove the listing, warn the seller, or limit or close the account. Repeated or serious problems, such as fraud, lead to a permanent ban, and we may report fraud to the police.',
        'If you see a listing that breaks these rules, please use the "Report" option on the listing page.',
      ],
    },
  ],
}
