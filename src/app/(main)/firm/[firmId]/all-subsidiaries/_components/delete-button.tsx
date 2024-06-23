'use client'
import {
  removeSubSidiary,
  getSubsidiaryDetails,
  logActivityNotification,
} from '@/lib/queries'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
  subsidiaryId: string
}

const DeleteButton = ({ subsidiaryId }: Props) => {
  const router = useRouter()

  return (
    <div
      className="text-white"
      onClick={async () => {
        const response = await getSubsidiaryDetails(subsidiaryId)
        await logActivityNotification({
          firmId: undefined,
          description: `Deleted a subsidiary | ${response?.name}`,
          subsidiaryId,
        })
        await removeSubSidiary(subsidiaryId)
        router.refresh()
      }}
    >
      Delete Subsidiary
    </div>
  )
}

export default DeleteButton
