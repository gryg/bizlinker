import { AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { fetchAuthenticatedUserDetails } from '@/lib/queries'
import { SubSidiary } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

import React from 'react'
import DeleteButton from './_components/delete-button'
import CreateSubsidiaryButton from './_components/create-subsidiary-btn'

type Props = {
  params: { firmId: string }
}

const AllSubsidiariesPage = async ({ params }: Props) => {
  const user = await fetchAuthenticatedUserDetails()
  if (!user) return

  return (
    <AlertDialog>
      <div className="flex flex-col ">
        <CreateSubsidiaryButton
          user={user}
          id={params.firmId}
          className="w-[200px] self-end m-6"
        />
        <Command className="rounded-lg bg-transparent">
          <CommandInput placeholder="Search Account..." />
          <CommandList>
            <CommandEmpty>No Results Found.</CommandEmpty>
            <CommandGroup heading="Subsidiaries">
              {!!user.Firm?.SubSidiary.length ? (
                user.Firm.SubSidiary.map((subsidiary: SubSidiary) => (
                  <CommandItem
                    key={subsidiary.id}
                    className="h-32 !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all"
                  >
                    <Link
                      href={`/subsidiary/${subsidiary.id}`}
                      className="flex gap-4 w-full h-full"
                    >
                      <div className="relative w-32">
                        <Image
                          src={subsidiary.subSidiaryLogo}
                          alt="subsidiary logo"
                          fill
                          className="rounded-md object-contain bg-muted/50 p-4"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="flex flex-col">
                          {subsidiary.name}
                          <span className="text-muted-foreground text-xs">
                            {subsidiary.address}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <AlertDialogTrigger asChild>
                      <Button
                        size={'sm'}
                        variant={'destructive'}
                        className="w-20 hover:bg-red-600 hover:text-white !text-white"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-left">
                          Are your absolutely sure
                        </AlertDialogTitle>
                        <AlertDescription className="text-left">
                          This action cannot be undon. This will delete the
                          subsidiary and all data related to the subsidiary.
                        </AlertDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex items-center">
                        <AlertDialogCancel className="mb-2">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive">
                          <DeleteButton subsidiaryId={subsidiary.id} />
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </CommandItem>
                ))
              ) : (
                <div className="text-muted-foreground text-center p-4">
                  No Subsidiaries
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </AlertDialog>
  )
}

export default AllSubsidiariesPage
