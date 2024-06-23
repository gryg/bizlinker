import {
  Contact,
  Lane,
  Notification,
  Prisma,
  Role,
  Tag,
  Ticket,
  User,
} from '@prisma/client'
import {
  _fetchTicketsWithAllRelations,
  fetchAuthenticatedUserDetails,
  fetchCampaigns,
  fetchMediaFiles,
  fetchStageDetails,
  getTicketsWithTags,
  fetchUserPermissions,
} from './queries'
import { db } from './db'
import { z } from 'zod'

import Stripe from 'stripe'

export type NotificationWithUser =
  | ({
      User: {
        id: string
        name: string
        avatarUrl: string
        email: string
        createdAt: Date
        updatedAt: Date
        role: Role
        firmId: string | null
      }
    } & Notification)[]
  | undefined

export type UserWithPermissionsAndSubSidiaries = Prisma.PromiseReturnType<
  typeof fetchUserPermissions
>

export const CampaignPageSchema = z.object({
  name: z.string().min(1),
  pathName: z.string().optional(),
})

const __getUsersWithFirmSubSidiaryPermissionsSidebarOptions = async (
  firmId: string
) => {
  return await db.user.findFirst({
    where: { Firm: { id: firmId } },
    include: {
      Firm: { include: { SubSidiary: true } },
      Permissions: { include: { SubSidiary: true } },
    },
  })
}

export type AuthUserWithFirmSigebarOptionsSubSidiaries =
  Prisma.PromiseReturnType<typeof fetchAuthenticatedUserDetails>

export type UsersWithFirmSubSidiaryPermissionsSidebarOptions =
  Prisma.PromiseReturnType<
    typeof __getUsersWithFirmSubSidiaryPermissionsSidebarOptions
  >

export type GetMediaFiles = Prisma.PromiseReturnType<typeof fetchMediaFiles>

export type CreateMediaType = Prisma.MediaCreateWithoutSubsidiaryInput

export type TicketAndTags = Ticket & {
  Tags: Tag[]
  Assigned: User | null
  Customer: Contact | null
}

export type LaneDetail = Lane & {
  Tickets: TicketAndTags[]
}

export const CreateStageFormSchema = z.object({
  name: z.string().min(1),
})

export const CreateCampaignFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
})

export type StageDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<
  typeof fetchStageDetails
>

export const LaneFormSchema = z.object({
  name: z.string().min(1),
})

export type TicketWithTags = Prisma.PromiseReturnType<typeof getTicketsWithTags>

const currencyNumberRegex = /^\d+(\.\d{1,2})?$/

export const TicketFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.string().refine((value) => currencyNumberRegex.test(value), {
    message: 'Value must be a valid price.',
  }),
})

export type TicketDetails = Prisma.PromiseReturnType<
  typeof _fetchTicketsWithAllRelations
>

export const ContactUserFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
})

export type Address = {
  city: string
  country: string
  line1: string
  postal_code: string
  state: string
}

export type ShippingInfo = {
  address: Address
  name: string
}

export type StripeCustomerType = {
  email: string
  name: string
  shipping: ShippingInfo
  address: Address
}

export type PricesList = Stripe.ApiList<Stripe.Price>

export type CampaignsForSubSidiary = Prisma.PromiseReturnType<
  typeof fetchCampaigns
>[0]

export type UpsertCampaignPage = Prisma.CampaignPageCreateWithoutCampaignInput
