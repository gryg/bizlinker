import SubSidiaryDetails from '@/components/forms/subsidiary-details'
import UserDetails from '@/components/forms/user-details'
import BlurPage from '@/components/global/blur-page'
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

type Props = {
  params: { subsidiaryId: string }
}

const SubsidiarySettingPage = async ({ params }: Props) => {
  const authUser = await currentUser()
  if (!authUser) return
  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  })
  if (!userDetails) return

  const subSidiary = await db.subSidiary.findUnique({
    where: { id: params.subsidiaryId },
  })
  if (!subSidiary) return

  const firmDetails = await db.firm.findUnique({
    where: { id: subSidiary.firmId },
    include: { SubSidiary: true },
  })

  if (!firmDetails) return
  const subSidiaries = firmDetails.SubSidiary

  return (
    <BlurPage>
      <div className="flex lg:!flex-row flex-col gap-4">
        <SubSidiaryDetails
          firmDetails={firmDetails}
          details={subSidiary}
          userId={userDetails.id}
          userName={userDetails.name}
        />
        <UserDetails
          type="subsidiary"
          id={params.subsidiaryId}
          subSidiaries={subSidiaries}
          userData={userDetails}
        />
      </div>
    </BlurPage>
  )
}

export default SubsidiarySettingPage
