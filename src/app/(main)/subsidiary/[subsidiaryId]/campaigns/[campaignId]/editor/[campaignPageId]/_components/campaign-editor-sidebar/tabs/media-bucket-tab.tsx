'use client'
import MediaComponent from '@/components/media'
import { fetchMediaFiles } from '@/lib/queries'
import { GetMediaFiles } from '@/lib/types'
import React, { useEffect, useState } from 'react'

type Props = {
  subsidiaryId: string
}

const MediaBucketTab = (props: Props) => {
  const [data, setdata] = useState<GetMediaFiles>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchMediaFiles(props.subsidiaryId)
      setdata(response)
    }
    fetchData()
  }, [props.subsidiaryId])

  return (
    <div className="h-[900px] overflow-scroll p-4">
      <MediaComponent
        data={data}
        subsidiaryId={props.subsidiaryId}
      />
    </div>
  )
}

export default MediaBucketTab
