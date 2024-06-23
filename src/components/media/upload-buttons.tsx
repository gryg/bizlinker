'use client'
import { useModal } from '@/providers/modal-provider'
import React from 'react'
import { Button } from '../ui/button'
import CustomModal from '../global/custom-modal'
import UploadMediaForm from '../forms/upload-media'

type Props = {
  subsidiaryId: string
}

const MediaUploadButton = ({ subsidiaryId }: Props) => {
  const { isOpen, setOpen, setClose } = useModal()

  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal
            title="Upload Media"
            subheading="Upload a file to your media bucket"
          >
            <UploadMediaForm subsidiaryId={subsidiaryId}></UploadMediaForm>
          </CustomModal>
        )
      }}
    >
      Upload
    </Button>
  )
}

export default MediaUploadButton
