import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/db'
import {
  fetchLanesWithTicketsAndTags,
  fetchStageDetails,
  updateLanesOrder,
  updateTicketsOrder,
} from '@/lib/queries'
import { LaneDetail } from '@/lib/types'
import { redirect } from 'next/navigation'
import React from 'react'
import StageInfoBar from '../_components/stage-infobar'
import StageSettings from '../_components/stage-settings'
import StageView from '../_components/stage-view'

type Props = {
  params: { subsidiaryId: string; stageId: string }
}

const StagePage = async ({ params }: Props) => {
  const stageDetails = await fetchStageDetails(params.stageId)
  if (!stageDetails)
    return redirect(`/subsidiary/${params.subsidiaryId}/stages`)

  const stages = await db.stage.findMany({
    where: { subSidiaryId: params.subsidiaryId },
  })

  const lanes = (await fetchLanesWithTicketsAndTags(
    params.stageId
  )) as LaneDetail[]

  return (
    <Tabs
      defaultValue="view"
      className="w-full"
    >
      <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
        <StageInfoBar
          stageId={params.stageId}
          subSidiaryId={params.subsidiaryId}
          stages={stages}
        />
        <div>
          <TabsTrigger value="view">Stage View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="view">
        <StageView
          lanes={lanes}
          stageDetails={stageDetails}
          stageId={params.stageId}
          subsidiaryId={params.subsidiaryId}
          updateLanesOrder={updateLanesOrder}
          updateTicketsOrder={updateTicketsOrder}
        />
      </TabsContent>
      <TabsContent value="settings">
        <StageSettings
          stageId={params.stageId}
          stages={stages}
          subsidiaryId={params.subsidiaryId}
        />
      </TabsContent>
    </Tabs>
  )
}

export default StagePage
