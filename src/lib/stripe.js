export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TAgEDRuNGCzIREeb5AVwfvNMXwsrCbGfsSFRrkNUcz9zD1StTi4ZreWXWx1j7MvyMWVdJ83TgdTNL37datjJ0EG00nfEprwWA'

export const PRODUCTS = {
  tokens: [
    {
      id: 'starter',
      name: 'Starter Pack',
      tokens: 500,
      price: 2.99,
      priceId: 'price_1TAgMlRuNGCzIREeRkudqJhW',
      tag: 'BEST TO START',
      color: 'var(--ice)',
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      tokens: 2000,
      price: 7.99,
      priceId: 'price_1TAgN9RuNGCzIREe3f44SEQy',
      tag: 'MOST POPULAR',
      color: 'var(--fire)',
    },
    {
      id: 'whale',
      name: 'Whale Pack',
      tokens: 6000,
      price: 19.99,
      priceId: 'price_1TAgNVRuNGCzIREehTztvyAw',
      tag: 'BEST VALUE',
      color: 'var(--gold)',
    },
  ],
  subscriptions: [
    {
      id: 'explorer',
      name: 'Explorer',
      price: 4.99,
      priceId: 'price_1TAgOQRuNGCzIREeYCV98hod',
      color: 'var(--ice)',
      features: [
        'Unlimited daily takes',
        'Live vote breakdowns',
        'Full tournament access',
        'Complete take history',
        'No ads',
      ],
    },
    {
      id: 'creator',
      name: 'Creator Pro',
      price: 9.99,
      priceId: 'price_1TAgOhRuNGCzIREeyluCG6sJ',
      color: 'var(--gold)',
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
