import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  params: { subsidiaryId: string }
}

const Stages = async ({ params }: Props) => {
  const stageExists = await db.stage.findFirst({
    where: { subSidiaryId: params.subsidiaryId },
  })

  if (stageExists)
    return redirect(
      `/subsidiary/${params.subsidiaryId}/stages/${stageExists.id}`
    )

  try {
    const response = await db.stage.create({
      data: { name: 'First Stage', subSidiaryId: params.subsidiaryId },
    })

    return redirect(
      `/subsidiary/${params.subsidiaryId}/stages/${response.id}`
    )
  } catch (error) {
    console.log()
  }
}

export default Stages
