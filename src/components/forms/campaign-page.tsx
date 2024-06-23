'use client'
import React, { useEffect } from 'react'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { useToast } from '../ui/use-toast'
import { CampaignPage } from '@prisma/client'
import { CampaignPageSchema } from '@/lib/types'
import {
  removeCampaignPage,
  fetchCampaigns,
  logActivityNotification,
  upsertCampaignPageDetails,
} from '@/lib/queries'
import { useRouter } from 'next/navigation'
import { v4 } from 'uuid'
import { CopyPlusIcon, Trash } from 'lucide-react'

interface CreateCampaignPageProps {
  defaultData?: CampaignPage
  campaignId: string
  order: number
  subsidiaryId: string
}

const CreateCampaignPage: React.FC<CreateCampaignPageProps> = ({
  defaultData,
  campaignId,
  order,
  subsidiaryId,
}) => {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof CampaignPageSchema>>({
    resolver: zodResolver(CampaignPageSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      pathName: '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({ name: defaultData.name, pathName: defaultData.pathName })
    }
  }, [defaultData])

  const onSubmit = async (values: z.infer<typeof CampaignPageSchema>) => {
    if (order !== 0 && !values.pathName)
      return form.setError('pathName', {
        message:
          "Pages other than the first page in the campaign require a path name example 'secondstep'.",
      })
    try {
      const response = await upsertCampaignPageDetails(
        subsidiaryId,
        {
          ...values,
          id: defaultData?.id || v4(),
          order: defaultData?.order || order,
          pathName: values.pathName || '',
        },
        campaignId
      )

      await logActivityNotification({
        firmId: undefined,
        description: `Updated a campaign page | ${response?.name}`,
        subsidiaryId: subsidiaryId,
      })

      toast({
        title: 'Success',
        description: 'Saves Campaign Page Details',
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Oops...!',
        description: 'Could Save Campaign Page Details',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Page</CardTitle>
        <CardDescription>
          Campaign pages are flow in the order they are created by default. You
          can move them around to change their order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Name</FormLabel>
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
            <FormField
              disabled={form.formState.isSubmitting || order === 0}
              control={form.control}
              name="pathName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Path Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Path for the page"
                      {...field}
                      value={field.value?.toLowerCase()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <Button
                className="w-22 self-end"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting ? <Loading /> : 'Save Page'}
              </Button>

              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  className="w-22 self-end border-destructive text-destructive hover:bg-destructive"
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    const response = await removeCampaignPage(defaultData.id)
                    await logActivityNotification({
                      firmId: undefined,
                      description: `Deleted a campaign page | ${response?.name}`,
                      subsidiaryId: subsidiaryId,
                    })
                    router.refresh()
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <Trash />}
                </Button>
              )}
              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  size={'icon'}
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    const response = await fetchCampaigns(subsidiaryId)
                    const lastCampaignPage = response.find(
                      (campaign) => campaign.id === campaignId
                    )?.CampaignPages.length

                    await upsertCampaignPageDetails(
                      subsidiaryId,
                      {
                        ...defaultData,
                        id: v4(),
                        order: lastCampaignPage ? lastCampaignPage : 0,
                        visits: 0,
                        name: `${defaultData.name} Copy`,
                        pathName: `${defaultData.pathName}copy`,
                        content: defaultData.content,
                      },
                      campaignId
                    )
                    toast({
                      title: 'Success',
                      description: 'Saves Campaign Page Details',
                    })
                    router.refresh()
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <CopyPlusIcon />}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CreateCampaignPage
