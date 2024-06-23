'use client'
import React from 'react'
import StageInfobar from './stage-infobar'
import { Stage } from '@prisma/client'
import CreateStageForm from '@/components/forms/create-stage-form'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { removeStage } from '@/lib/queries'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

const StageSettings = ({
  stageId,
  subsidiaryId,
  stages,
}: {
  stageId: string
  subsidiaryId: string
  stages: Stage[]
}) => {
  const router = useRouter()
  return (
    <AlertDialog>
      <div>
        <div className="flex items-center justify-between mb-4">
          <AlertDialogTrigger asChild>
            <Button variant={'destructive'}>Delete Stage</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="items-center">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await removeStage(stageId)
                    toast({
                      title: 'Deleted',
                      description: 'Stage is deleted',
                    })
                    router.replace(`/subsidiary/${subsidiaryId}/stages`)
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: 'Oops...!',
                      description: 'Could Delete Stage',
                    })
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>

        <CreateStageForm
          subSidiaryId={subsidiaryId}
          defaultData={stages.find((p) => p.id === stageId)}
        />
      </div>
    </AlertDialog>
  )
}

export default StageSettings
