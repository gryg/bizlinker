import BlurPage from '@/components/global/blur-page'
import InfoBar from '@/components/global/infobar'
import Sidebar from '@/components/sidebar'
import Unauthorized from '@/components/unauthorized'
import {
  fetchNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: { firmId: string }
}

const layout = async ({ children, params }: Props) => {
  const firmId = await verifyAndAcceptInvitation()
  const user = await currentUser()

  if (!user) {
    return redirect('/')
  }

  if (!firmId) {
    return redirect('/firm')
  }

  if (
    user.privateMetadata.role !== 'FIRM_OWNER' &&
    user.privateMetadata.role !== 'FIRM_ADMIN'
  )
    return <Unauthorized />

  let allNoti: any = []
  const notifications = await fetchNotificationAndUser(firmId)
  if (notifications) allNoti = notifications

 

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        id={params.firmId}
        type="firm"
      />
      <div className="md:pl-[300px]">
        <InfoBar
          notifications={allNoti}
          role={allNoti.User?.role}
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  )
}

export default layout
