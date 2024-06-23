'use client'
import {
  AuthUserWithFirmSigebarOptionsSubSidiaries,
  UserWithPermissionsAndSubSidiaries,
} from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { SubSidiary, User } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import {
  modifyUserPermissions,
  fetchAuthenticatedUserDetails,
  fetchUserPermissions,
  logActivityNotification,
  updateUserData,
} from '@/lib/queries'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import FileUpload from '../global/file-upload'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { v4 } from 'uuid'

type Props = {
  id: string | null
  type: 'firm' | 'subsidiary'
  userData?: Partial<User>
  subSidiaries?: SubSidiary[]
}

const UserDetails = ({ id, type, subSidiaries, userData }: Props) => {
  const [subSidiaryPermissions, setSubSidiariesPermissions] =
    useState<UserWithPermissionsAndSubSidiaries | null>(null)
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithFirmSigebarOptionsSubSidiaries | null>(null)
  const { data, setClose } = useModal()
  const [roleState, setRoleState] = useState('')
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  
  const { toast } = useToast()
  const router = useRouter()

  //Get authUserDtails

  useEffect(() => {
    if (data.user) {
      const fetchDetails = async () => {
        const response = await fetchAuthenticatedUserDetails()
        if (response) setAuthUserData(response)
      }
      fetchDetails()
    }
  }, [data])

  const userDataSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string(),
    role: z.enum([
      'FIRM_OWNER',
      'FIRM_ADMIN',
      'SUBSIDIARY_USER',
      'SUBSIDIARY_GUEST',
    ]),
  })

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      name: userData ? userData.name : data?.user?.name,
      email: userData ? userData.email : data?.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
      role: userData ? userData.role : data?.user?.role,
    },
  })

  useEffect(() => {
    if (!data.user) return
    const fetchPermissions = async () => {
      if (!data.user) return
      const permission = await fetchUserPermissions(data.user.id)
      setSubSidiariesPermissions(permission)
    }
    fetchPermissions()
  }, [data, form])

  useEffect(() => {
    if (data.user) {
      form.reset(data.user)
    }
    if (userData) {
      form.reset(userData)
    }
  }, [userData, data])

  const onChangePermission = async (
    subSidiaryId: string,
    val: boolean,
    permissionsId: string | undefined
  ) => {
    if (!data.user?.email) return
    setLoadingPermissions(true)
    const response = await modifyUserPermissions(
      permissionsId ? permissionsId : v4(),
      data.user.email,
      subSidiaryId,
      val
    )
    if (type === 'firm') {
      await logActivityNotification({
        firmId: authUserData?.Firm?.id,
        description: `Gave ${userData?.name} access to | ${
          subSidiaryPermissions?.Permissions.find(
            (p) => p.subSidiaryId === subSidiaryId
          )?.SubSidiary.name
        } `,
        subsidiaryId: subSidiaryPermissions?.Permissions.find(
          (p) => p.subSidiaryId === subSidiaryId
        )?.SubSidiary.id,
      })
    }

    if (response) {
      toast({
        title: 'Success',
        description: 'The request was successfull',
      })
      if (subSidiaryPermissions) {
        subSidiaryPermissions.Permissions.find((perm) => {
          if (perm.subSidiaryId === subSidiaryId) {
            return { ...perm, access: !perm.access }
          }
          return perm
        })
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: 'Unable to update permissions',
      })
    }
    router.refresh()
    setLoadingPermissions(false)
  }

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    if (!id) return
    if (userData || data?.user) {
      const updatedUser = await updateUserData(values)
      authUserData?.Firm?.SubSidiary.filter((subacc) =>
        authUserData.Permissions.find(
          (p) => p.subSidiaryId === subacc.id && p.access
        )
      ).forEach(async (subsidiary) => {
        await logActivityNotification({
          firmId: undefined,
          description: `Updated ${userData?.name} information`,
          subsidiaryId: subsidiary.id,
        })
      })

      if (updatedUser) {
        toast({
          title: 'Success',
          description: 'Update User Information',
        })
        setClose()
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          title: 'Oops...!',
          description: 'Unable to update user information',
        })
      }
    } else {
      console.log('Error unable to submit')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or update your information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User full name</FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="Full Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userData?.role === 'FIRM_OWNER' ||
                        form.formState.isSubmitting
                      }
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel> User Role</FormLabel>
                  <Select
                    disabled={field.value === 'FIRM_OWNER'}
                    onValueChange={(value) => {
                      if (
                        value === 'SUBSIDIARY_USER' ||
                        value === 'SUBSIDIARY_GUEST'
                      ) {
                        setRoleState(
                          'You need to have subsidiaries to assign Subsidiary access to team members.'
                        )
                      } else {
                        setRoleState('')
                      }
                      field.onChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FIRM_ADMING">
                        Firm Admin
                      </SelectItem>
                      {(data?.user?.role === 'FIRM_OWNER' ||
                        userData?.role === 'FIRM_OWNER') && (
                        <SelectItem value="FIRM_OWNER">
                          Firm Owner
                        </SelectItem>
                      )}
                      <SelectItem value="SUBSIDIARY_USER">
                        Subsidiary User
                      </SelectItem>
                      <SelectItem value="SUBSIDIARY_GUEST">
                        Subsidiary Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />

            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Save User Details'}
            </Button>
            {authUserData?.role === 'FIRM_OWNER' && (
              <div>
                <Separator className="my-4" />
                <FormLabel> User Permissions</FormLabel>
                <FormDescription className="mb-4">
                  You can give subsidiary access to a team member by turning on
                  access control for each Subsidiary. *only visible to
                  firm owners)
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subSidiaries?.map((subSidiary) => {
                    const subSidiaryPermissionsDetails =
                      subSidiaryPermissions?.Permissions.find(
                        (p) => p.subSidiaryId === subSidiary.id
                      )
                    return (
                      <div
                        key={subSidiary.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p>{subSidiary.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subSidiaryPermissionsDetails?.access}
                          onCheckedChange={(permission) => {
                            onChangePermission(
                              subSidiary.id,
                              permission,
                              subSidiaryPermissionsDetails?.id
                            )
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UserDetails
