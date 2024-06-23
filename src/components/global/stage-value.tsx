'use client'
import { fetchStages } from '@/lib/queries'
import { Prisma } from '@prisma/client'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card'
import { Progress } from '../ui/progress'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

type Props = {
  subsidiaryId: string
}

const StageValue = ({ subsidiaryId }: Props) => {
  const [stages, setStages] = useState<
    Prisma.PromiseReturnType<typeof fetchStages>
  >([])

  const [selectedStageId, setselectedStageId] = useState('')
  const [stageClosedValue, setStageClosedValue] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchStages(subsidiaryId)
      setStages(res)
      setselectedStageId(res[0]?.id)
    }
    fetchData()
  }, [subsidiaryId])

  const totalStageValue = useMemo(() => {
    if (stages.length) {
      return (
        stages
          .find((stage) => stage.id === selectedStageId)
          ?.Lane?.reduce((totalLanes, lane, currentLaneIndex, array) => {
            const laneTicketsTotal = lane.Tickets.reduce(
              (totalTickets, ticket) => totalTickets + Number(ticket?.value),
              0
            )
            if (currentLaneIndex === array.length - 1) {
              setStageClosedValue(laneTicketsTotal || 0)
              return totalLanes
            }
            return totalLanes + laneTicketsTotal
          }, 0) || 0
      )
    }
    return 0
  }, [selectedStageId, stages])

  const stageRate = useMemo(
    () =>
      (stageClosedValue / (totalStageValue + stageClosedValue)) * 100,
    [stageClosedValue, totalStageValue]
  )

  return (
    <Card className="relative w-full xl:w-[350px]">
      <CardHeader>
        <CardDescription>Stage Value</CardDescription>
        <small className="text-xs text-muted-foreground">
          Stage Progress
        </small>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Closed €{stageClosedValue}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Total €{totalStageValue + stageClosedValue}
            </p>
          </div>
        </div>
        <Progress
          color="green"
          value={stageRate}
          className="h-2"
        />
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="mb-2">
          Total value of all tickets in the given stage except the last lane.
          Your last lane is considered your closing lane in every stage.
        </p>
        <Select
          value={selectedStageId}
          onValueChange={setselectedStageId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Stages</SelectLabel>
              {stages.map((stage) => (
                <SelectItem
                  value={stage.id}
                  key={stage.id}
                >
                  {stage.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

export default StageValue
