import Unauthorized from '@/components/unauthorized'
import { fetchAuthenticatedUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  searchParams: { state: string; code: string }
}

const SubSidiaryMainPage = async ({ searchParams }: Props) => {
  const firmId = await verifyAndAcceptInvitation()

  if (!firmId) {
    return <Unauthorized />
  }

  const user = await fetchAuthenticatedUserDetails()
  if (!user) return

  const getFirstSubsidiaryWithAccess = user.Permissions.find(
    (permission) => permission.access === true
  )

  if (searchParams.state) {
    const statePath = searchParams.state.split('___')[0]
    const stateSubsidiaryId = searchParams.state.split('___')[1]
    if (!stateSubsidiaryId) return <Unauthorized />
    return redirect(
      `/subsidiary/${stateSubsidiaryId}/${statePath}?code=${searchParams.code}`
    )
  }

  if (getFirstSubsidiaryWithAccess) {
    return redirect(`/subsidiary/${getFirstSubsidiaryWithAccess.subSidiaryId}`)
  }

  return <Unauthorized />
}

export default SubSidiaryMainPage
