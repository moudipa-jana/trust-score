import { capitalize } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Card from '@/components/Card';
import {
  dateFormate,
  formatShortCount,
  getStrapiMedia,
  shortWords,
} from '@/lib/helpers';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import { useState } from 'react';

interface BlogBigCardsProps {
  blogsList: Blog[];
  variantTop?: boolean;
}

export default function BlogBigCards({ blogsList, variantTop }: BlogBigCardsProps) {
  const router = useRouter();
  const [hushTalksModal, setHushTalksModal] = useState(false);
  const [blogData, setBlogData] = useState<Blog | null>(null);

  return (
    <>
      <SensitiveContentModal
        open={hushTalksModal}
        onClose={() => setHushTalksModal(!hushTalksModal)}
        onDeny={() => setHushTalksModal(false)}
        onConfirm={() => {
          setHushTalksModal(false);
          router.push(`/sunrise-club/${router.query.categoryName}/${blogData?.attributes?.slug}`);
        }}
      />

      <div className={variantTop ? '' : 'mb-4'}>
        {blogsList && blogsList.sort((a: Blog, b: Blog) => new Date(b.attributes.publish_date).getTime() - new Date(a.attributes.publish_date).getTime()).slice(0, 2).map((data: Blog) => {
          return (
            <div className=" blogCard" key={data.id}>
              <Link
                href={`javascript:void(0);`}
                onClick={(e) => {
                  if (data?.attributes?.blog_categories?.data.some((cat) => cat.attributes.title === 'Hush Talks' || cat.attributes.title === 'She Reads' || cat.attributes.title === 'She Read')) {
                    e.preventDefault();
                    setBlogData(data);
                    setHushTalksModal(true);
                  } else {
                    router.push(`/sunrise-club/${router.query.categoryName}/${data?.attributes?.slug}`);
                  }
                }}
              >
                <Card
                  link={`/sunrise-club/${router.query.categoryName}/${data?.attributes?.slug}`}
                  coverImg={getStrapiMedia(
                    data?.attributes?.coverImg?.data?.attributes?.url,
                  )}
                  cardTag={
                    data?.attributes?.blog_categories?.data[0]?.attributes
                      ?.title
                  }
                  blogtags={data?.attributes?.blog_categories}
                  imgHeight={300}
                  blogId={data.id}
                  imgWidth={229}
                  variant={variantTop ? 'horizontal' : 'vertical'}
                  date={dateFormate(data.attributes?.publish_date)}
                  count={formatShortCount(+data?.attributes?.views || 0)}
                  color="bg-white-300"
                  title={capitalize(data?.attributes?.Title)}
                  description={shortWords(data?.attributes?.shortDes, 250)}
                />
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
