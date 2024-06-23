import InfoBar from '@/components/global/infobar'
import Sidebar from '@/components/sidebar'
import Unauthorized from '@/components/unauthorized'
import {
  fetchAuthenticatedUserDetails,
  fetchNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries'
import { currentUser } from '@clerk/nextjs'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: { subsidiaryId: string }
}

const SubsidiaryLayout = async ({ children, params }: Props) => {
  const firmId = await verifyAndAcceptInvitation()
  if (!firmId) return <Unauthorized />
  const user = await currentUser()
  if (!user) {
    return redirect('/')
  }

  let notifications: any = []

  if (!user.privateMetadata.role) {
    return <Unauthorized />
  } else {
    const allPermissions = await fetchAuthenticatedUserDetails()
    const hasPermission = allPermissions?.Permissions.find(
      (permissions) =>
        permissions.access && permissions.subSidiaryId === params.subsidiaryId
    )
    if (!hasPermission) {
      return <Unauthorized />
    }

    const allNotifications = await fetchNotificationAndUser(firmId)

    if (
      user.privateMetadata.role === 'FIRM_ADMIN' ||
      user.privateMetadata.role === 'FIRM_OWNER'
    ) {
      notifications = allNotifications
    } else {
      const filteredNoti = allNotifications?.filter(
        (item) => item.subSidiaryId === params.subsidiaryId
      )
      if (filteredNoti) notifications = filteredNoti
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        id={params.subsidiaryId}
        type="subsidiary"
      />

      <div className="md:pl-[300px]">
        <InfoBar
          notifications={notifications}
          role={user.privateMetadata.role as Role}
          subSidiaryId={params.subsidiaryId as string}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  )
} 

export default SubsidiaryLayout
