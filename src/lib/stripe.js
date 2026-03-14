export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TAgEDRuNGCzIREeb5AVwfvNMXwsrCbGfsSFRrkNUcz9zD1StTi4ZreWXWx1j7MvyMWVdJ83TgdTNL37datjJ0EG00nfEprwWA'

export const PRODUCTS = {
  tokens: [
    {
      id: 'starter',
      name: 'Starter Pack',
      tokens: 500,
      price: 2.99,
      paymentLink: 'https://buy.stripe.com/test_6oU7sNfF02gm7ad83BaMU04',
      tag: 'BEST TO START',
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      tokens: 2000,
      price: 7.99,
      paymentLink: 'https://buy.stripe.com/test_7sY4gBdwS6wC2TX0B9aMU03',
      tag: 'MOST POPULAR',
    },
    {
      id: 'whale',
      name: 'Whale Pack',
      tokens: 6000,
      price: 19.99,
      paymentLink: 'https://buy.stripe.com/test_5kQ8wR2Se4oueCF4RpaMU02',
      tag: 'BEST VALUE',
    },
  ],
  subscriptions: [
    {
      id: 'explorer',
      name: 'Explorer',
      price: 4.99,
      paymentLink: 'https://buy.stripe.com/test_8x27sN78u08e0LP97FaMU01',
      features: [
        'Unlimited daily takes',
        'Live vote breakdowns',
        'Full tournament access',
        'Complete take history',
        'No ads ever',
      ],
    },
    {
      id: 'creator',
      name: 'Creator Pro',
      price: 9.99,
      paymentLink: 'https://buy.stripe.com/test_dRmdRb8cy5sy3Y1bfNaMU00',
      tag: 'MOST POWERFUL',
      features: [
        'Everything in Explorer',
        'Featured feed placement',
        'Full take analytics',
        'Host your own battles',
        'Revenue share on tournaments',
        'Verified Creator badge',
        'Priority brand tournaments',
      ],
    },
  ],
}
