import FirmDetails from '@/components/forms/firm-details'
import { fetchAuthenticatedUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs'
import { Plan } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string }
}) => {
  const firmId = await verifyAndAcceptInvitation()
  console.log(firmId)

  //fetch user details
  const user = await fetchAuthenticatedUserDetails()
  if (firmId) {
    if (user?.role === 'SUBSIDIARY_GUEST' || user?.role === 'SUBSIDIARY_USER') {
      return redirect('/subsidiary')
    } else if (user?.role === 'FIRM_OWNER' || user?.role === 'FIRM_ADMIN') {
      if (searchParams.plan) {
        return redirect(`/firm/${firmId}/billing?plan=${searchParams.plan}`)
      }
      if (searchParams.state) {
        const statePath = searchParams.state.split('___')[0]
        const stateFirmId = searchParams.state.split('___')[1]
        if (!stateFirmId) return <div>Not authorized</div>
        return redirect(
          `/firm/${stateFirmId}/${statePath}?code=${searchParams.code}`
        )
      } else return redirect(`/firm/${firmId}`)
    } else {
      return <div>Not authorized</div>
    }
  }
  const authUser = await currentUser()
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl"> Create An Firm</h1>
        <FirmDetails
          data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
        />
      </div>
    </div>
  )
}

export default Page
