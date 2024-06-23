import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'BizLinker',
    version: '1.0.0',
  },
})


