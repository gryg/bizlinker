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
import { Campaign, Lane, Stage } from '@prisma/client'
import { Input } from '../ui/input'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { LaneFormSchema } from '@/lib/types'
import {
  fetchStageDetails,
  logActivityNotification,
  upsertCampaignDetails,
  upsertLaneDetails,
  upsertStageDetails,
} from '@/lib/queries'
import { v4 } from 'uuid'
import { toast } from '../ui/use-toast'
import { useModal } from '@/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'

interface CreateLaneFormProps {
  defaultData?: Lane
  stageId: string
}

const LaneForm: React.FC<CreateLaneFormProps> = ({
  defaultData,
  stageId,
}) => {
  const { setClose } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof LaneFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(LaneFormSchema),
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

  const onSubmit = async (values: z.infer<typeof LaneFormSchema>) => {
    if (!stageId) return
    try {
      const response = await upsertLaneDetails({
        ...values,
        id: defaultData?.id,
        stageId: stageId,
        order: defaultData?.order,
      })

      const d = await fetchStageDetails(stageId)
      if (!d) return

      await logActivityNotification({
        firmId: undefined,
        description: `Updated a lane | ${response?.name}`,
        subsidiaryId: d.subSidiaryId,
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
        <CardTitle>Lane Details</CardTitle>
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
                  <FormLabel>Lane Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lane Name"
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

export default LaneForm
