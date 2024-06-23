import BlurPage from '@/components/global/blur-page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { db } from '@/lib/db'
import { Contact, SubSidiary, Ticket } from '@prisma/client'
import format from 'date-fns/format'
import React from 'react'
import CraeteContactButton from './_components/create-contact-btn'
import { formatDate } from 'date-fns'

type Props = {
  params: { subsidiaryId: string }
}

const ContactPage = async ({ params }: Props) => {
  type SubSidiaryWithContacts = SubSidiary & {
    Contact: (Contact & { Ticket: Ticket[] })[]
  }

  const contacts = (await db.subSidiary.findUnique({
    where: {
      id: params.subsidiaryId,
    },

    include: {
      Contact: {
        include: {
          Ticket: {
            select: {
              value: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })) as SubSidiaryWithContacts

  const allContacts = contacts.Contact

  const formatTotal = (tickets: Ticket[]) => {
    if (!tickets || !tickets.length) return '€0.00'
    const amt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'EUR',
    })

    const laneAmt = tickets.reduce(
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    )

    return amt.format(laneAmt)
  }
  return (
    <BlurPage>
      <h1 className="text-4xl p-4">Contacts</h1>
      <CraeteContactButton subsidiaryId={params.subsidiaryId} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[300px]">Email</TableHead>
            <TableHead className="w-[200px]">Active</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allContacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage alt="@shadcn" />
                  <AvatarFallback className="bg-primary text-white">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                {formatTotal(contact.Ticket) === '€0.00' ? (
                  <Badge variant={'destructive'}>Inactive</Badge>
                ) : (
                  <Badge className="bg-emerald-700">Active</Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(contact.createdAt, 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-right">
                {formatTotal(contact.Ticket)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </BlurPage>
  )
}

export default ContactPage

