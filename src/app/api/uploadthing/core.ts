import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@clerk/nextjs'

const f = createUploadthing()

const authenticateUser = () => {
  const user = auth()
  if (!user) throw new Error('Unauthorized')
  return user
}
  // define as many FileRoutes, each with a unique routeSlug

export const ourFileRouter = {
  subsidiaryLogo: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(() => {}),
  avatar: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(() => {}),
  firmLogo: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(() => {}),
  media: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(() => {}),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
