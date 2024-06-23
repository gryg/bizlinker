import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { subscriptionCreated } from '@/lib/stripe/stripe-actions'

const stripeWebhookEvents = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
])

export async function POST(req: NextRequest) {
  let stripeEvent: Stripe.Event
  const body = await req.text()
  const sig = headers().get('Stripe-Signature')
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET
  try {
    if (!sig || !webhookSecret) {
      console.log(
        'Error Stripe webhook secret (or signature) can not be found.'
      )
      return
    }
    stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (error: any) {
    console.log(`Error ${error.message}`)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  //
  try {
    if (stripeWebhookEvents.has(stripeEvent.type)) {
      const subscription = stripeEvent.data.object as Stripe.Subscription
      if (
        !subscription.metadata.connectAccountPayments &&
        !subscription.metadata.connectAccountSubscriptions
      ) {
        switch (stripeEvent.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated': {
            if (subscription.status === 'active') {
              await subscriptionCreated(
                subscription,
                subscription.customer as string
              )
              console.log('CREATED through STRIPE WEBHOOK', subscription)
            } else {
              console.log(
                'SKIPPED @ WEBHOOK creation because subscription status is not active',
                subscription
              )
              break
            }
          }
          default:
            console.log('Error for unhandled events', stripeEvent.type)
        }
      } else {
        console.log(
          'SKIPPED FROM WEBHOOK because subscription was from a connected account not for the application',
          subscription
        )
      }
    }
  } catch (error) {
    console.log(error)
    return new NextResponse('Stripe Webhook Error', { status: 400 })
  }
  return NextResponse.json(
    {
      webhookActionReceived: true,
    },
    {
      status: 200,
    }
  )
}
