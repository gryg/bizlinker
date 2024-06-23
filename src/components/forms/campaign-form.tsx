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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { Campaign } from '@prisma/client'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { CreateCampaignFormSchema } from '@/lib/types'
import { logActivityNotification, upsertCampaignDetails } from '@/lib/queries'
import { v4 } from 'uuid'
import { toast } from '../ui/use-toast'
import { useModal } from '@/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import FileUpload from '../global/file-upload'

interface CreateCampaignProps {
  defaultData?: Campaign
  subSidiaryId: string
}

const CampaignForm: React.FC<CreateCampaignProps> = ({
  defaultData,
  subSidiaryId,
}) => {
  const { setClose } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof CreateCampaignFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CreateCampaignFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
      description: defaultData?.description || '',
      favicon: defaultData?.favicon || '',
      subDomainName: defaultData?.subDomainName || '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        description: defaultData.description || '',
        favicon: defaultData.favicon || '',
        name: defaultData.name || '',
        subDomainName: defaultData.subDomainName || '',
      })
    }
  }, [defaultData])

  const isLoading = form.formState.isLoading

  const onSubmit = async (values: z.infer<typeof CreateCampaignFormSchema>) => {
    if (!subSidiaryId) return
    const response = await upsertCampaignDetails(
      subSidiaryId,
      { ...values, liveProducts: defaultData?.liveProducts || '[]' },
      defaultData?.id || v4()
    )
    await logActivityNotification({
      firmId: undefined,
      description: `Update campaign | ${response.name}`,
      subsidiaryId: subSidiaryId,
    })
    if (response)
      toast({
        title: 'Success',
        description: 'Saved campaign details',
      })
    else
      toast({
        variant: 'destructive',
        title: 'Oops...!',
        description: 'Unable to save campaign details',
      })
    setClose()
    router.refresh()
  }
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Campaign Details</CardTitle>
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
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit more about this campaign."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="subDomainName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub domain</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Sub domain for campaign"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="favicon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favicon</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subsidiaryLogo"
                      value={field.value}
                      onChange={field.onChange}
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

export default CampaignForm
