import CampaignEditor from '@/app/(main)/subsidiary/[subsidiaryId]/campaigns/[campaignId]/editor/[campaignPageId]/_components/campaign-editor'
import { getDomainContent } from '@/lib/queries'
import EditorProvider from '@/providers/editor/editor-provider'
import { notFound } from 'next/navigation'
import React from 'react'

const Page = async ({
  params,
}: {
  params: { domain: string; path: string }
}) => {
  const domainData = await getDomainContent(params.domain.slice(0, -1))
  const pageData = domainData?.CampaignPages.find(
    (page) => page.pathName === params.path
  )

  if (!pageData || !domainData) return notFound()

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
