import FirmDetails from '@/components/forms/firm-details'
import UserDetails from '@/components/forms/user-details'
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

type Props = {
  params: { firmId: string }
}

const SettingsPage = async ({ params }: Props) => {
  const authUser = await currentUser()
  if (!authUser) return null

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  })

  if (!userDetails) return null
  const firmDetails = await db.firm.findUnique({
    where: {
      id: params.firmId,
    },
    include: {
      SubSidiary: true,
    },
  })

  if (!firmDetails) return null

  const subSidiaries = firmDetails.SubSidiary

  return (
    <div className="flex lg:!flex-row flex-col gap-4">
      <FirmDetails data={firmDetails} />
      <UserDetails
        type="firm"
        id={params.firmId}
        subSidiaries={subSidiaries}
        userData={userDetails}
      />
    </div>
  )
}

export default SettingsPage
