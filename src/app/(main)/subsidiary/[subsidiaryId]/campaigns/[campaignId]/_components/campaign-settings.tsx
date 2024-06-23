import React from 'react'

import { Campaign, SubSidiary } from '@prisma/client'
import { db } from '@/lib/db'
import { getConnectAccountProducts } from '@/lib/stripe/stripe-actions'


import CampaignForm from '@/components/forms/campaign-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import CampaignProductsTable from './campaign-products-table'

interface CampaignSettingsProps {
  subsidiaryId: string
  defaultData: Campaign
}

const CampaignSettings: React.FC<CampaignSettingsProps> = async ({
  subsidiaryId,
  defaultData,
}) => {
  // connect stripe products

  const subsidiaryDetails = await db.subSidiary.findUnique({
    where: {
      id: subsidiaryId,
    },
  })

  if (!subsidiaryDetails) return
  if (!subsidiaryDetails.connectAccountId) return
  const products = await getConnectAccountProducts(
    subsidiaryDetails.connectAccountId
  )

  return (
    <div className="flex gap-4 flex-col xl:!flex-row">
      <Card className="flex-1 flex-shrink">
        <CardHeader>
          <CardTitle>Campaign Products</CardTitle>
          <CardDescription>
            Select the products and services you wish to sell on this campaign.
            You can sell one time and recurring products too.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <>
            {subsidiaryDetails.connectAccountId ? (
              <CampaignProductsTable
                defaultData={defaultData}
                products={products}
              />
            ) : (
              'Connect your stripe account to sell products.'
            )}
          </>
        </CardContent>
      </Card>

      <CampaignForm
        subSidiaryId={subsidiaryId}
        defaultData={defaultData}
      />
    </div>
  )
}

export default CampaignSettings
