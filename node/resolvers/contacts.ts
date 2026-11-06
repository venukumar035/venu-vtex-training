import { ServiceContext } from '@vtex/api'
import { Clients } from '../clients'

type Context = ServiceContext<Clients>

interface ContactsArgs {
  page?: number
  pageSize?: number
}

const ENTITY_ACRONYM = 'CQ'
const FIELDS = [
  'id',
  'name',
  'email',
  'subject',
  'message',
  'attachmentName',
  'createdIn',
]

export const getContacts = async (
  _: unknown,
  { page = 1, pageSize = 10 }: ContactsArgs,
  ctx: Context
) => {
  const {
    clients: { masterdata },
  } = ctx

  try {
    const { data: docs } = await masterdata.searchDocumentsWithPaginationInfo<Record<string, any>>({
      dataEntity: ENTITY_ACRONYM,
      fields: FIELDS,
      pagination: {
        page,
        pageSize,
      },
      schema: undefined,
    })

    if (!docs || docs.length === 0) {
      return []
    }

    return docs.map((item) => ({
      id: item.id,
      name: item.name || '',
      email: item.email || '',
      subject: item.subject || '',
      message: item.message || '',
      attachmentName: item.attachmentName || '',
      createdIn: item.createdIn || '',
    }))
  } catch (error) {
    console.error('Error fetching contacts in resolver:', error)
    return []
  }
}