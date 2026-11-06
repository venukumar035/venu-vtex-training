import { ExternalClient, InstanceOptions, IOContext, Apps } from '@vtex/api'

export interface PaginationParams {
  page: number
  pageSize: number
  where?: string
  sort?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

interface AppSettings {
  apiKey?: string
  appToken?: string
}

export default class CustomMasterDataClient extends ExternalClient {
  private settings: AppSettings | null = null

  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.account}.vtexcommercestable.com.br`,
      context,
      options
    )
  }

  private async getHeaders() {
    if (!this.settings) {
      const apps = new Apps(this.context)
      this.settings = await apps.getAppSettings(process.env.VTEX_APP_ID ?? '')
    }

    return {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.vtex.ds.v10+json',
      'X-VTEX-API-AppKey': this.settings?.apiKey ?? '',
      'X-VTEX-API-AppToken': this.settings?.appToken ?? '',
    }
  }

  public async getPaginatedData<T = any>(
    dataEntity: string,
    fields: string[],
    { page = 1, pageSize = 10, where, sort }: PaginationParams
  ): Promise<PaginatedResponse<T>> {
    const headers = await this.getHeaders()

    // Master Data v1 search endpoint
    const queryParams = new URLSearchParams({
      _fields: fields.join(','),
      _page: String(page),
      _size: String(pageSize),
    })

    if (where) queryParams.append('_where', where)
    if (sort) queryParams.append('_sort', sort)

    const url = `/api/dataentities/${dataEntity}/search?${queryParams.toString()}`

    const response = await this.http.getRaw<T[]>(url, { headers })

    // Extract total count from Master Data REST-Range header (e.g., "resources 0-9/45")
    const rangeHeader = response.headers['rest-content-range'] || response.headers['content-range'] || ''
    const totalMatch = rangeHeader.match(/\/(\d+)/)
    const total = totalMatch ? parseInt(totalMatch[1], 10) : response.data.length

    return {
      data: response.data,
      pagination: {
        page,
        pageSize,
        total,
      },
    }
  }
}