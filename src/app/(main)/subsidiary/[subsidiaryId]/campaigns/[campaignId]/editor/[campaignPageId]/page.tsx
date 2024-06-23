import { db } from '@/lib/db'
import EditorProvider from '@/providers/editor/editor-provider'
import { redirect } from 'next/navigation'
import React from 'react'
import CampaignEditorNavigation from './_components/campaign-editor-navigation'
import CampaignEditorSidebar from './_components/campaign-editor-sidebar'
import CampaignEditor from './_components/campaign-editor'

type Props = {
  params: {
    subsidiaryId: string
    campaignId: string
    campaignPageId: string
  }
}

const Page = async ({ params }: Props) => {
  const campaignPageDetails = await db.campaignPage.findFirst({
    where: {
      id: params.campaignPageId,
    },
  })
  if (!campaignPageDetails) {
    return redirect(
      `/subsidiary/${params.subsidiaryId}/campaigns/${params.campaignId}`
    )
  }

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        subsidiaryId={params.subsidiaryId}
        campaignId={params.campaignId}
        pageDetails={campaignPageDetails}
      >
        <CampaignEditorNavigation
          campaignId={params.campaignId}
          campaignPageDetails={campaignPageDetails}
          subsidiaryId={params.subsidiaryId}
        />
        <div className="h-full flex justify-center">
          <CampaignEditor campaignPageId={params.campaignPageId} />
        </div>

        <CampaignEditorSidebar subsidiaryId={params.subsidiaryId} />
      </EditorProvider>
    </div>
  )
}

export default Page
