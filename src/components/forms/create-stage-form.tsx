'use client'
import React, { useEffect } from 'react'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { Campaign, Stage } from '@prisma/client'
import { Input } from '../ui/input'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { CreateStageFormSchema } from '@/lib/types'
import {
  logActivityNotification,
  upsertCampaignDetails,
  upsertStageDetails,
} from '@/lib/queries'
import { v4 } from 'uuid'
import { toast } from '../ui/use-toast'
import { useModal } from '@/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'

interface CreateStageFormProps {
  defaultData?: Stage
  subSidiaryId: string
}

const CreateStageForm: React.FC<CreateStageFormProps> = ({
  defaultData,
  subSidiaryId,
}) => {
  const { data, isOpen, setOpen, setClose } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof CreateStageFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CreateStageFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || '',
      })
    }
  }, [defaultData])

  const isLoading = form.formState.isLoading

  const onSubmit = async (values: z.infer<typeof CreateStageFormSchema>) => {
    if (!subSidiaryId) return
    try {
      const response = await upsertStageDetails({
        ...values,
        id: defaultData?.id,
        subSidiaryId: subSidiaryId,
      })

      await logActivityNotification({
        firmId: undefined,
        description: `Updates a stage | ${response?.name}`,
        subsidiaryId: subSidiaryId,
      })

      toast({
        title: 'Success',
        description: 'Saved stage details',
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops...!',
        description: 'Unable to save stage details',
      })
    }

    setClose()
  }
  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Stage Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-20 mt-4"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CreateStageForm
