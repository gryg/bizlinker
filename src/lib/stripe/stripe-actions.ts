'use server'
import Stripe from 'stripe'
import { db } from '../db'
import { stripe } from '.'

export const subscriptionCreated = async (
  subscription: Stripe.Subscription,
  customerId: string
) => {
  try {
    const firm = await db.firm.findFirst({
      where: {
        customerId,
      },
      include: {
        SubSidiary: true,
      },
    })
    if (!firm) {
      throw new Error('Unable to find and firm to upsert the subscription')
    }

    const data = {
      active: subscription.status === 'active',
      firmId: firm.id,
      customerId,
      currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
      //@ts-ignore
      priceId: subscription.plan.id,
      subscritiptionId: subscription.id,
      //@ts-ignore
      plan: subscription.plan.id,
    }

    const res = await db.subscription.upsert({
      where: {
        firmId: firm.id,
      },
      create: data,
      update: data,
    })
    console.log(`Created Subscription for ${subscription.id}`)
  } catch (error) {
    console.log('Error from Create action', error)
  }
}

export const getConnectAccountProducts = async (stripeAccount: string) => {
  const products = await stripe.products.list(
    {
      limit: 50,
      expand: ['data.default_price'],
    },
    {
      stripeAccount,
    }
  )
  return products.data
}
