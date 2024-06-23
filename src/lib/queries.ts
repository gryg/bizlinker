'use server'

import { clerkClient, currentUser } from '@clerk/nextjs'
import { db } from './db'
import { redirect } from 'next/navigation'
import {
  Firm,
  Lane,
  Plan,
  Prisma,
  Role,
  SubSidiary,
  Tag,
  Ticket,
  User,
} from '@prisma/client'
import { v4 } from 'uuid'
import {
  CreateCampaignFormSchema,
  CreateMediaType,
  UpsertCampaignPage,
} from './types'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

export const fetchAuthenticatedUserDetails = async () => {
  const user = await currentUser()
  if (!user) {
    return
  }

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Firm: {
        include: {
          SidebarOption: true,
          SubSidiary: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  })

  return userData
}

export const logActivityNotification = async ({
  firmId,
  description,
  subsidiaryId,
}: {
  firmId?: string
  description: string
  subsidiaryId?: string
}) => {
  const authUser = await currentUser()
  let userData
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Firm: {
          SubSidiary: {
            some: { id: subsidiaryId },
          },
        },
      },
    })
    if (response) {
      userData = response
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    })
  }

  if (!userData) {
    console.log('Unable to find user')
    return
  }

  let foundFirmId = firmId
  if (!foundFirmId) {
    if (!subsidiaryId) {
      throw new Error(
        'Provide at least one of the following: firmId, subsidiaryId'
      )
    }
    const response = await db.subSidiary.findUnique({
      where: { id: subsidiaryId },
    })
    if (response) foundFirmId = response.firmId
  }
  if (subsidiaryId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Firm: {
          connect: {
            id: foundFirmId,
          },
        },
        SubSidiary: {
          connect: { id: subsidiaryId },
        },
      },
    })
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Firm: {
          connect: {
            id: foundFirmId,
          },
        },
      },
    })
  }
}

export const createTeamUser = async (firmId: string, user: User) => {
  if (user.role === 'FIRM_OWNER') return null
  const response = await db.user.create({ data: { ...user } })
  return response
}

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser()
  if (!user) return redirect('/sign-in')
  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: 'PENDING',
    },
  })

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.firmId, {
      email: invitationExists.email,
      firmId: invitationExists.firmId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await logActivityNotification({
      firmId: invitationExists?.firmId,
      description: `Joined`,
      subsidiaryId: undefined,
    })

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || 'SUBSIDIARY_USER',
        },
      })

      await db.invitation.delete({
        where: { email: userDetails.email },
      })

      return userDetails.firmId
    } else return null
  } else {
    const firm = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    })
    return firm ? firm.firmId : null
  }
}

export const updateFirmDetails = async (
  firmId: string,
  firmDetails: Partial<Firm>
) => {
  const response = await db.firm.update({
    where: { id: firmId },
    data: { ...firmDetails },
  })
  return response
}

export const removeFirm = async (firmId: string) => {
  const response = await db.firm.delete({ where: { id: firmId } })
  return response
}

export const initializeUser = async (newUser: Partial<User>) => {
  const user = await currentUser()
  if (!user) return

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || 'SUBSIDIARY_USER',
    },
  })

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || 'SUBSIDIARY_USER',
    },
  })

  return userData
}

export const upsertFirmDetails = async (firm: Firm, price?: Plan) => {
  if (!firm.companyEmail) return null
  try {
    const firmDetails = await db.firm.upsert({
      where: {
        id: firm.id,
      },
      update: firm,
      create: {
        users: {
          connect: { email: firm.companyEmail },
        },
        ...firm,
        SidebarOption: {
          create: [
            { name: 'Dashboard', icon: 'category', link: `/firm/${firm.id}` },
            { name: 'Linkedaccounts', icon: 'clipboardIcon', link: `/firm/${firm.id}/linkedaccounts` },
            { name: 'Billing', icon: 'payment', link: `/firm/${firm.id}/billing` },
            { name: 'Settings', icon: 'settings', link: `/firm/${firm.id}/settings` },
            { name: 'Subsidiaries', icon: 'person', link: `/firm/${firm.id}/all-subsidiaries` },
            { name: 'Team', icon: 'shield', link: `/firm/${firm.id}/team` },
          ],
        },
      },
    })
    return firmDetails
  } catch (error) {
    console.log(error)
  }
}

export const fetchNotificationAndUser = async (firmId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { firmId },
      include: { User: true },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return response
  } catch (error) {
    console.log(error)
  }
}

export const upsertSubsidiaryDetails = async (subSidiary: SubSidiary) => {
  if (!subSidiary.companyEmail) return null
  const firmOwner = await db.user.findFirst({
    where: {
      Firm: {
        id: subSidiary.firmId,
      },
      role: 'FIRM_OWNER',
    },
  })
  if (!firmOwner) return console.log('Unable to create a subsidiary')
  const permissionId = v4()
  const response = await db.subSidiary.upsert({
    where: { id: subSidiary.id },
    update: subSidiary,
    create: {
      ...subSidiary,
      Permissions: {
        create: {
          access: true,
          email: firmOwner.email,
          id: permissionId,
        },
        connect: {
          subSidiaryId: subSidiary.id,
          id: permissionId,
        },
      },
      Stage: {
        create: { name: 'Prospects' },
      },
      SidebarOption: {
        create: [
          { name: 'Linked Accounts', icon: 'clipboardIcon', link: `/subsidiary/${subSidiary.id}/linkedaccounts` },
          { name: 'Settings', icon: 'settings', link: `/subsidiary/${subSidiary.id}/settings` },
          { name: 'Campaigns', icon: 'stages', link: `/subsidiary/${subSidiary.id}/campaigns` },
          { name: 'Media', icon: 'database', link: `/subsidiary/${subSidiary.id}/media` },
          // { name: 'Selfregulators ~WIP~', icon: 'chip', link: `/subsidiary/${subSidiary.id}/selfregulators/WIP` },
          { name: 'Stages', icon: 'flag', link: `/subsidiary/${subSidiary.id}/stages` },
          { name: 'Contacts', icon: 'person', link: `/subsidiary/${subSidiary.id}/contacts` },
          { name: 'Dashboard', icon: 'category', link: `/subsidiary/${subSidiary.id}` },
        ],
      },
    },
  })
  return response
}

export const fetchUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubSidiary: true } } },
  })

  return response
}

export const updateUserData = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: { email: user.email },
    data: { ...user },
  })

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || 'SUBSIDIARY_USER',
    },
  })

  return response
}

export const modifyUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  subSidiaryId: string,
  permission: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subSidiaryId: subSidiaryId,
      },
    })
    return response
  } catch (error) {
    console.log('Unable to modify permissions!', error)
  }
}

export const getSubsidiaryDetails = async (subsidiaryId: string) => {
  const response = await db.subSidiary.findUnique({
    where: {
      id: subsidiaryId,
    },
  })
  return response
}

export const removeSubSidiary = async (subsidiaryId: string) => {
  const response = await db.subSidiary.delete({
    where: {
      id: subsidiaryId,
    },
  })
  return response
}

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  })
  const deletedUser = await db.user.delete({ where: { id: userId } })

  return deletedUser
}

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  return user
}

export const sendUserInvitation = async (
  role: Role,
  email: string,
  firmId: string
) => {
  const resposne = await db.invitation.create({
    data: { email, firmId, role },
  })

  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }

  return resposne
}

export const fetchMediaFiles = async (subsidiaryId: string) => {
  const mediafiles = await db.subSidiary.findUnique({
    where: {
      id: subsidiaryId,
    },
    include: { Media: true },
  })
  return mediafiles
}

export const addMediaFile = async (
  subsidiaryId: string,
  mediaFile: CreateMediaType
) => {
  const response = await db.media.create({
    data: {
      link: mediaFile.link,
      name: mediaFile.name,
      subSidiaryId: subsidiaryId,
    },
  })

  return response
}

export const removeMediaFile = async (mediaId: string) => {
  const response = await db.media.delete({
    where: {
      id: mediaId,
    },
  })
  return response
}

export const fetchStageDetails = async (stageId: string) => {
  const response = await db.stage.findUnique({
    where: {
      id: stageId,
    },
  })
  return response
}

export const fetchLanesWithTicketsAndTags = async (stageId: string) => {
  const response = await db.lane.findMany({
    where: {
      stageId,
    },
    orderBy: { order: 'asc' },
    include: {
      Tickets: {
        orderBy: {
          order: 'asc',
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        },
      },
    },
  })
  return response
}

export const upsertCampaignDetails = async (
  subsidiaryId: string,
  campaign: z.infer<typeof CreateCampaignFormSchema> & { liveProducts: string },
  campaignId: string
) => {
  const response = await db.campaign.upsert({
    where: { id: campaignId },
    update: campaign,
    create: {
      ...campaign,
      id: campaignId || v4(),
      subSidiaryId: subsidiaryId,
    },
  })

  return response
}

export const upsertStageDetails = async (
  stage: Prisma.StageUncheckedCreateWithoutLaneInput
) => {
  const response = await db.stage.upsert({
    where: { id: stage.id || v4() },
    update: stage,
    create: stage,
  })

  return response
}

export const removeStage = async (stageId: string) => {
  const response = await db.stage.delete({
    where: { id: stageId },
  })
  return response
}

export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        data: {
          order: lane.order,
        },
      })
    )

    await db.$transaction(updateTrans)
    console.log('Reorder successfull')
  } catch (error) {
    console.log(error, 'LANES REORDERING FAILED!')
  }
}

export const updateTicketsOrder = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      })
    )

    await db.$transaction(updateTrans)
    console.log('Reorder successfull')
  } catch (error) {
    console.log(error, 'ERROR @ UPDATING TICKETS ORDER!')
  }
}

export const upsertLaneDetails = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        stageId: lane.stageId,
      },
    })

    order = lanes.length
  } else {
    order = lane.order
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: { ...lane, order },
  })

  return response
}

export const removeLane = async (laneId: string) => {
  const resposne = await db.lane.delete({ where: { id: laneId } })
  return resposne
}

export const getTicketsWithTags = async (stageId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        stageId,
      },
    },
    include: { Tags: true, Assigned: true, Customer: true },
  })
  return response
}

export const _fetchTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: { laneId: laneId },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  })
  return response
}

export const fetchSubSidiaryTeamMembers = async (subsidiaryId: string) => {
  const subsidiaryUsersWithAccess = await db.user.findMany({
    where: {
      Firm: {
        SubSidiary: {
          some: {
            id: subsidiaryId,
          },
        },
      },
      role: 'SUBSIDIARY_USER',
      Permissions: {
        some: {
          subSidiaryId: subsidiaryId,
          access: true,
        },
      },
    },
  })
  return subsidiaryUsersWithAccess
}

export const searchContacts = async (searchTerms: string) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  })
  return response
}

export const upsertTicketDetails = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[]
) => {
  let order: number
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: { laneId: ticket.laneId },
    })
    order = tickets.length
  } else {
    order = ticket.order
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, Tags: { set: tags } },
    create: { ...ticket, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  })

  return response
}

export const removeTicket = async (ticketId: string) => {
  const response = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  })

  return response
}

export const upsertTagDetails = async (
  subsidiaryId: string,
  tag: Prisma.TagUncheckedCreateInput
) => {
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), subSidiaryId: subsidiaryId },
    update: tag,
    create: { ...tag, subSidiaryId: subsidiaryId },
  })

  return response
}

export const fetchTagsForSubsidiary = async (subsidiaryId: string) => {
  const response = await db.subSidiary.findUnique({
    where: { id: subsidiaryId },
    select: { Tags: true },
  })
  return response
}

export const removeTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } })
  return response
}

export const upsertContactDetails = async (
  contact: Prisma.ContactUncheckedCreateInput
) => {
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: contact,
    create: contact,
  })
  return response
}

export const fetchCampaigns = async (subsidiaryId: string) => {
  const campaigns = await db.campaign.findMany({
    where: { subSidiaryId: subsidiaryId },
    include: { CampaignPages: true },
  })

  return campaigns
}

export const fetchCampaignById = async (campaignId: string) => {
  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      CampaignPages: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  return campaign
}

export const updateCampaignProducts = async (
  products: string,
  campaignId: string
) => {
  const data = await db.campaign.update({
    where: { id: campaignId },
    data: { liveProducts: products },
  })
  return data
}

export const upsertCampaignPageDetails = async (
  subsidiaryId: string,
  campaignPage: UpsertCampaignPage,
  campaignId: string
) => {
  if (!subsidiaryId || !campaignId) return
  const response = await db.campaignPage.upsert({
    where: { id: campaignPage.id || '' },
    update: { ...campaignPage },
    create: {
      ...campaignPage,
      content: campaignPage.content
        ? campaignPage.content
        : JSON.stringify([
            {
              content: [],
              id: '__body',
              name: 'Body',
              styles: { backgroundColor: 'white' },
              type: '__body',
            },
          ]),
      campaignId,
    },
  })

  revalidatePath(`/subsidiary/${subsidiaryId}/campaigns/${campaignId}`, 'page')
  return response
}

export const removeCampaignPage = async (campaignPageId: string) => {
  const response = await db.campaignPage.delete({ where: { id: campaignPageId } })

  return response
}

export const getCampaignPageDetails = async (campaignPageId: string) => {
  const response = await db.campaignPage.findUnique({
    where: {
      id: campaignPageId,
    },
  })

  return response
}

export const getDomainContent = async (subDomainName: string) => {
  const response = await db.campaign.findUnique({
    where: {
      subDomainName,
    },
    include: { CampaignPages: true },
  })
  return response
}

export const fetchStages = async (subsidiaryId: string) => {
  const response = await db.stage.findMany({
    where: { subSidiaryId: subsidiaryId },
    include: {
      Lane: {
        include: { Tickets: true },
      },
    },
  })
  return response
}
