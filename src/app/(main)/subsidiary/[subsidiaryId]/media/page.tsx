import BlurPage from '@/components/global/blur-page'
import MediaComponent from '@/components/media'
import { fetchMediaFiles } from '@/lib/queries'
import React from 'react'

type Props = {
  params: { subsidiaryId: string }
}

const MediaPage = async ({ params }: Props) => {
  const data = await fetchMediaFiles(params.subsidiaryId)

  return (
    <BlurPage>
      <MediaComponent
        data={data}
        subsidiaryId={params.subsidiaryId}
      />
    </BlurPage>
  )
}

export default MediaPage
