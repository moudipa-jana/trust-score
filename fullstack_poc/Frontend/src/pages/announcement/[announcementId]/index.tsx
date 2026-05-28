import { isEmpty } from 'lodash';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import React, { useEffect, useState } from 'react';

import { getAnnouncementById } from '@/actions/forum';
import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import ForumAnnouncementCard, {
  Announcement,
} from '@/components/pages/Forum/posts/ForumAnnouncementCard';
import NotAvailableCard from '@/components/pages/Forum/posts/NotAvailableCard';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import withCommonData from '@/lib/withCommonData';
import { MenuItem } from '@/types/menu';

interface AnnouncementComponentProps {
  announcementId: string;
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: Blog[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
}

export default function AnnouncementById({
  announcementId,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: AnnouncementComponentProps) {
  const [postData, setPostData] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        const data = await getAnnouncementById(announcementId);
        if (isEmpty(data)) {
          setError(true);
        } else {
          setPostData(data);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (announcementId) {
      fetchAnnouncement();
    }
  }, [announcementId]);

  return (
    <PageBase
      title={postData?.title || 'Announcement'}
      description={postData?.description || 'View post details'}
      sharingDescription="Hey, Checkout the announcement I found on Kofuku Social. Here is the link"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="sm-container pb-20">
        {loading ? (
          <div className="mt-20">
            <TabletLoader style={{ height: 180 }} />
          </div>
        ) : !loading && (isEmpty(postData) || error) ? (
          <div className="mt-10">
            <NotAvailableCard />
          </div>
        ) : (
          <div>
            <ForumAnnouncementCard
              announcementsData={[{ ...postData }] as Announcement[]}
              footerDisable
              announcementPage
            />
          </div>
        )}
      </div>
    </PageBase>
  );
}

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const announcementId = context.params?.announcementId as string;

    // Redirect to 404 if announcementId is null or undefined
    if (announcementId === 'null' || announcementId === 'undefined') {
      return {
        notFound: true,
        props: {},
      };
    }

    return {
      props: {
        announcementId,
      },
    };
  },
);
