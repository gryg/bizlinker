import { fetchCampaigns } from '@/lib/queries'
import React from 'react'
import CampaignsDataTable from './data-table'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import CampaignForm from '@/components/forms/campaign-form'
import BlurPage from '@/components/global/blur-page'

const Campaigns = async ({ params }: { params: { subsidiaryId: string } }) => {
  const campaigns = await fetchCampaigns(params.subsidiaryId)
  if (!campaigns) return null

  return (
    <BlurPage>
      <CampaignsDataTable
        actionButtonText={
          <>
            <Plus size={17} />
            Create Campaign
          </>
        }
        modalChildren={
          <CampaignForm subSidiaryId={params.subsidiaryId}></CampaignForm>
        }
        filterValue="name"
        columns={columns}
        data={campaigns}
      />
    </BlurPage>
  )
}

export default Campaigns
