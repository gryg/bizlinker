import BlurPage from '@/components/global/blur-page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchCampaignById } from '@/lib/queries'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import CampaignSettings from './_components/campaign-settings'
import CampaignSteps from './_components/campaign-steps'

type Props = {
  params: { campaignId: string; subsidiaryId: string }
}

const CampaignPage = async ({ params }: Props) => {
  const campaignPages = await fetchCampaignById(params.campaignId)
  if (!campaignPages)
    return redirect(`/subsidiary/${params.subsidiaryId}/campaigns`)

  return (
    <BlurPage>
      <Link
        href={`/subsidiary/${params.subsidiaryId}/campaigns`}
        className="flex justify-between gap-4 mb-4 text-muted-foreground"
      >
        Back
      </Link>
      <h1 className="text-3xl mb-8">{campaignPages.name}</h1>
      <Tabs
        defaultValue="steps"
        className="w-full"
      >
        <TabsList className="grid  grid-cols-2 w-[50%] bg-transparent ">
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="steps">
          <CampaignSteps
            campaign={campaignPages}
            subsidiaryId={params.subsidiaryId}
            pages={campaignPages.CampaignPages}
            campaignId={params.campaignId}
          />
        </TabsContent>
        <TabsContent value="settings">
          <CampaignSettings
            subsidiaryId={params.subsidiaryId}
            defaultData={campaignPages}
          />
        </TabsContent>
      </Tabs>
    </BlurPage>
  )
}

export default CampaignPage
