'use client'
import ContactUserForm from '@/components/forms/contact-user-form'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import { useModal } from '@/providers/modal-provider'
import React from 'react'

type Props = {
  subsidiaryId: string
}

const CraeteContactButton = ({ subsidiaryId }: Props) => {
  const { setOpen } = useModal()

  const handleCreateContact = async () => {
    setOpen(
      <CustomModal
        title="Create/update contact details."
        subheading="Customer contacts."
      >
        <ContactUserForm subsidiaryId={subsidiaryId} />
      </CustomModal>
    )
  }

  return <Button onClick={handleCreateContact}>Create Contact</Button>
}

export default CraeteContactButton
