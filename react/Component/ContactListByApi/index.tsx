import React, { useEffect, useState, useCallback } from 'react';
import { Table, Spinner, Button } from 'vtex.styleguide';
import { useCssHandles } from 'vtex.css-handles';

const CSS_HANDLES = [
  'contactContainer',
  'contactHeader',
  'contactTitle',
  'contactTableWrapper',
  'contactLoading',
  'contactError',
  'contactEmpty',
] as const;

interface ContactRecord {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  attachmentName?: string;
  createdIn?: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface StorefrontComponent<P = {}> extends React.FC<P> {
  schema?: Record<string, any>;
}

interface ContactListProps {
  title?: string;
  defaultPageSize?: number;
}

const ContactListApi: StorefrontComponent<ContactListProps> = ({
  title = 'Contact Inquiries',
  defaultPageSize = 10,
}) => {
  const handles = useCssHandles(CSS_HANDLES);

  const [items, setItems] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
  });

  const fetchContacts = useCallback(async (page: number, pageSize: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/_v/custom/contact-us?page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const res = await response.json();

      if (res.success) {
        setItems(res.data || []);
        setPagination({
          page: res.pagination?.page || page,
          pageSize: res.pagination?.pageSize || pageSize,
          total: res.pagination?.total || 0,
        });
      } else {
        throw new Error(res.message || 'Failed to retrieve contacts');
      }
    } catch (err) {
      const errorObj = err as any;
      setError(errorObj?.message || 'Error communicating with service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts(pagination.page, pagination.pageSize);
  }, [fetchContacts, pagination.page, pagination.pageSize]);

  const tableSchema = {
    properties: {
      name: {
        title: 'Full Name',
        width: 180,
      },
      email: {
        title: 'Email Address',
        width: 220,
      },
      subject: {
        title: 'Subject',
        width: 200,
      },
      message: {
        title: 'Message',
        minWidth: 260,
      },
      attachmentName: {
        title: 'Attachment',
        width: 160,
        cellRenderer: ({ cellData }: { cellData?: string }) => {
          return cellData ? cellData : '-';
        },
      },
      createdIn: {
        title: 'Created Date',
        width: 150,
        cellRenderer: ({ cellData }: { cellData?: string }) => {
          if (!cellData) return '-';
          return new Date(cellData).toLocaleDateString();
        },
      },
    },
  };

  const currentItemFrom =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const currentItemTo = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total,
  );

  return (
    <div
      className={handles.contactContainer}
      style={{ padding: '32px 20px', maxWidth: '1200px', margin: '0 auto' }}
    >
      <div
        className={handles.contactHeader}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h2
          className={handles.contactTitle}
          style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}
        >
          {title}
        </h2>
        <Button
          size='small'
          variation='tertiary'
          isLoading={loading}
          onClick={() => fetchContacts(pagination.page, pagination.pageSize)}
        >
          Refresh Data
        </Button>
      </div>

      {error && (
        <div
          className={handles.contactError}
          style={{
            marginBottom: '20px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #f87171',
            padding: '12px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            lineHeight: '1.4',
          }}
        >
          <strong>Error: </strong>
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div
          className={handles.contactLoading}
          style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}
        >
          <Spinner />
        </div>
      ) : (
        <div className={handles.contactTableWrapper}>
          <Table
            fullWidth
            schema={tableSchema}
            items={items}
            loading={loading}
            emptyStateLabel='No records found in Master Data (CQ).'
            pagination={{
              onNextClick: () =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 })),
              onPrevClick: () =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                })),
              onRowsChange: (_: unknown, val: string) => {
                setPagination({
                  page: 1,
                  pageSize: Number(val),
                  total: pagination.total,
                });
              },
              currentItemFrom,
              currentItemTo,
              textOf: 'of',
              textShowRows: 'Rows per page',
              totalItems: pagination.total,
              rowsOptions: [5, 10, 20, 50],
            }}
          />
        </div>
      )}
    </div>
  );
};

ContactListApi.schema = {
  title: 'Contact List Table',
  description: 'Displays paginated Contact Us records pulled from Master Data',
  type: 'object',
  properties: {
    title: {
      title: 'Section Title',
      type: 'string',
      default: 'Contact Inquiries',
    },
    defaultPageSize: {
      title: 'Default Rows Per Page',
      type: 'number',
      enum: [5, 10, 20],
      default: 10,
    },
  },
};

export default ContactListApi;