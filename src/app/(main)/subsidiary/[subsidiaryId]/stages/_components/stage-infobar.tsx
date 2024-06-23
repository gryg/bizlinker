'use client'
import CreateStageForm from '@/components/forms/create-stage-form'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useModal } from '@/providers/modal-provider'
import { Stage } from '@prisma/client'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  subSidiaryId: string
  stages: Stage[]
  stageId: string
}

const StageInfoBar = ({ stageId, stages, subSidiaryId }: Props) => {
  const { setOpen: setOpenModal, setClose } = useModal()
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(stageId)

  const handleClickCreateStage = () => {
    setOpenModal(
      <CustomModal
        title="Create A Stage"
        subheading="Stages allows you to group tickets into lanes and track your business processes all in one place."
      >
        <CreateStageForm subSidiaryId={subSidiaryId} />
      </CustomModal>
    )
  }

  return (
    <div>
      <div className="flex items-end gap-2">
        <Popover
          open={open}
          onOpenChange={setOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {value
                ? stages.find((stage) => stage.id === value)?.name
                : 'Select a stage...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandEmpty>No stages found.</CommandEmpty>
              <CommandGroup>
                {stages.map((stage) => (
                  <Link
                    key={stage.id}
                    href={`/subsidiary/${subSidiaryId}/stages/${stage.id}`}
                  >
                    <CommandItem
                      key={stage.id}
                      value={stage.id}
                      onSelect={(currentValue) => {
                        setValue(currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === stage.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {stage.name}
                    </CommandItem>
                  </Link>
                ))}
                <Button
                  variant="secondary"
                  className="flex gap-2 w-full mt-4"
                  onClick={handleClickCreateStage}
                >
                  <Plus size={15} />
                  Create Stage
                </Button>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default StageInfoBar
