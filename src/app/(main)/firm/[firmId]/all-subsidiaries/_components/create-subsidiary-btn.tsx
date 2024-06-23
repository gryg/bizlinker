'use client'
import SubSidiaryDetails from '@/components/forms/subsidiary-details'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import { useModal } from '@/providers/modal-provider'
import { Firm, FirmSidebarOption, SubSidiary, User } from '@prisma/client'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  user: User & {
    Firm:
      | (
          | Firm
          | (null & {
              SubSidiary: SubSidiary[]
              SideBarOption: FirmSidebarOption[]
            })
        )
      | null
  }
  id: string
  className: string
}

const CreateSubsidiaryButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal()
  const firmDetails = user.Firm

  if (!firmDetails) return

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a Subsidiary"
            subheading="You can switch bettween"
          >
            <SubSidiaryDetails
              firmDetails={firmDetails}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>
        )
      }}
    >
      <PlusCircleIcon size={15} />
      Create Subsidiary
    </Button>
  )
}

export default CreateSubsidiaryButton
