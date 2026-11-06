import { ServiceContext, RecorderState } from '@vtex/api';
import { Clients } from '../clients';

interface State extends RecorderState {}

type Context = ServiceContext<Clients, State>;

export async function getContactUsApi(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { customMasterData },
    query: { page = '1', pageSize = '10' },
  } = ctx;

  try {
    const DATA_ENTITY = 'CQ';
    const FIELDS = [
      'id',
      'name',
      'email',
      'subject',
      'message',
      'attachmentName',
      'createdIn',
    ];

    const parsedPage = Math.max(1, parseInt(page as string, 10) || 1);
    const parsedPageSize = Math.min(
      100,
      Math.max(1, parseInt(pageSize as string, 10) || 10),
    );

    const result = await customMasterData.getPaginatedData(
      DATA_ENTITY,
      FIELDS,
      {
        page: parsedPage,
        pageSize: parsedPageSize,
      },
    );

    ctx.status = 200;
    ctx.set('Cache-Control', 'no-cache, no-store');
    ctx.body = {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  } catch (error) {
    const err = error as any;
    ctx.status = err.response?.status || 500;
    ctx.set('Cache-Control', 'no-cache, no-store');
    ctx.body = {
      success: false,
      status: err.response?.status || 500,
      message:
        err.response?.data?.Message ||
        err.response?.data?.message ||
        err.message ||
        'Internal server error while fetching contact data',
      details: err.response?.data || null,
    };
  }

  await next();
}