import { db } from '@/lib/db'
import { getDomainContent } from '@/lib/queries'
import EditorProvider from '@/providers/editor/editor-provider'
import { notFound } from 'next/navigation'
import React from 'react'
import CampaignEditorNavigation from '../(main)/subsidiary/[subsidiaryId]/campaigns/[campaignId]/editor/[campaignPageId]/_components/campaign-editor-navigation'
import CampaignEditor from '../(main)/subsidiary/[subsidiaryId]/campaigns/[campaignId]/editor/[campaignPageId]/_components/campaign-editor'

const Page = async ({ params }: { params: { domain: string } }) => {
  const domainData = await getDomainContent(params.domain.slice(0, -1))
  if (!domainData) return notFound()

  const pageData = domainData.CampaignPages.find((page) => !page.pathName)

  if (!pageData) return notFound()

  await db.campaignPage.update({
    where: {
      id: pageData.id,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
  })

  return (
    <EditorProvider
      subsidiaryId={domainData.subSidiaryId}
      pageDetails={pageData}
      campaignId={domainData.id}
    >
      <CampaignEditor
        campaignPageId={pageData.id}
        liveMode={true}
      />
    </EditorProvider>
  )
}

export default Page
