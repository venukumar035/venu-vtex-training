import React, { useState } from 'react';
import { useQuery } from 'react-apollo';
import { Button, Table, Spinner } from 'vtex.styleguide';
import GET_CONTACTS from '../../Graphql/GetContacts.gql';

interface ContactItem {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  attachmentName?: string;
  createdIn?: string;
  [key: string]: unknown;
}

interface QueryData {
  getContacts: ContactItem[];
}

const PAGE_SIZE = 5;

const ContactListGQL: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const { data, loading, error, fetchMore } = useQuery<QueryData>(
    GET_CONTACTS,
    {
      variables: {
        page: 1,
        pageSize: PAGE_SIZE,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
    },
  );

  const tableSchema = {
    properties: {
      name: {
        title: 'Name',
        width: 180,
      },
      email: {
        title: 'Email',
        width: 220,
      },
      subject: {
        title: 'Subject',
        width: 180,
      },
      message: {
        title: 'Message',
        minWidth: 240,
      },
      attachmentName: {
        title: 'Attachment',
        width: 150,
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

  if (loading && !data) {
    return (
      <div className="flex flex-column items-center justify-center pv8">
        <Spinner size={40} />
        <p className="t-body c-muted-1 mt4">Loading contacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mw8 center ph4 pv6">
        <div className="ba b--danger bg-washed-red c-danger pa4 br2">
          <p className="f5 b ma0">Error retrieving contact inquiries</p>
          <p className="t-small ma0 mt2">{error.message}</p>
        </div>
      </div>
    );
  }

  const contacts = data?.getContacts || [];

  const handleSeeMore = async () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      if (fetchMore) {
        await fetchMore({
          variables: {
            page: nextPage,
            pageSize: PAGE_SIZE,
          },
          updateQuery: (
            prev: QueryData,
            { fetchMoreResult }: { fetchMoreResult?: QueryData },
          ): QueryData => {
            if (
              !fetchMoreResult ||
              !fetchMoreResult.getContacts ||
              fetchMoreResult.getContacts.length === 0
            ) {
              setHasMore(false);
              return prev;
            }

            if (fetchMoreResult.getContacts.length < PAGE_SIZE) {
              setHasMore(false);
            }

            return {
              ...prev,
              getContacts: [
                ...prev.getContacts,
                ...fetchMoreResult.getContacts,
              ],
            };
          },
        });
      }
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Failed to load more contacts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="mw8 center ph4 pv6">
      <div className="mb5">
        <h2 className="t-heading-2 c-on-base mb2">Contact Us Inquiries</h2>
        <p className="t-body c-muted-1 mt0">
          Showing {contacts.length} records
        </p>
      </div>

      <div className="ba b--muted-4 br2 overflow-hidden mb5">
        <Table
          fullWidth
          schema={tableSchema}
          items={contacts}
          density="medium"
          emptyStateLabel="No inquiries found in Master Data (CQ)."
        />
      </div>

      {hasMore && contacts.length >= PAGE_SIZE && (
        <div className="flex justify-center mt5">
          <Button
            variation="primary"
            size="regular"
            isLoading={loadingMore}
            onClick={handleSeeMore}
          >
            See More
          </Button>
        </div>
      )}
    </section>
  );
};

export default ContactListGQL;