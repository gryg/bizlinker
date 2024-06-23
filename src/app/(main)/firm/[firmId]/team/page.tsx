import { db } from '@/lib/db'
import React from 'react'
import DataTable from './data-table'
import { Plus } from 'lucide-react'
import { currentUser } from '@clerk/nextjs'
import { columns } from './columns'
import SendInvitation from '@/components/forms/send-invitation'

type Props = {
  params: { firmId: string }
}

const TeamPage = async ({ params }: Props) => {
  const authUser = await currentUser()
  const teamMembers = await db.user.findMany({
    where: {
      Firm: {
        id: params.firmId,
      },
    },
    include: {
      Firm: { include: { SubSidiary: true } },
      Permissions: { include: { SubSidiary: true } },
    },
  })

  if (!authUser) return null
  const firmDetails = await db.firm.findUnique({
    where: {
      id: params.firmId,
    },
    include: {
      SubSidiary: true,
    },
  })

  if (!firmDetails) return

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Add
        </>
      }
      modalChildren={<SendInvitation firmId={firmDetails.id} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    ></DataTable>
  )
}

export default TeamPage
