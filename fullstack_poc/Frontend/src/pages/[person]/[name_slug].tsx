import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Image from 'next/image';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import React, { useEffect, useState } from 'react';
import XShare from '/public/images/xshare.png';
import LinkedIn from '/public/images/linkedin-color.svg';
import TabNavigationAnimation from '@/components/Utility/TabNavigationAnimation';
import withCommonData from '@/lib/withCommonData';
import AuthorPageBlogList from '@/pages/AuthorPageBlogList';
import { getSingleAuthorService, getSingleDoctorService } from '@/service';
import type { MenuItem } from '@/types/menu';
import { formatTitleCaseName, validateImageUrl } from '@/lib/helpers';
import CustomImage from '@/components/Utility/CustomImage';

type BlogEntity = {
  id: string | number;
  attributes: {
    slug: string;
    Title: string;
    publish_date?: string | null;
    coverImg?: {
      data?: { attributes?: { url?: string; alternativeText?: string } };
    };
    blog_categories?: {
      data: Array<{ attributes?: { title?: string } }>;
    };
  };
};
type BlogsData = { blogs: { data: BlogEntity[] } };

function toBlogEntities(raw: any[] | undefined | null): BlogEntity[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((b) => {
      const a = b?.attributes ?? {};
      const slug = a.slug ?? a.Slug;
      const title = a.Title ?? a.title;
      if (!slug || !title) return null;
      return {
        id: b.id ?? Math.random().toString(36).slice(2),
        attributes: {
          slug: String(slug),
          Title: String(title),
          publish_date: a.publish_date ?? null,
          coverImg: a.coverImg ?? undefined,
          blog_categories: a.blog_categories ?? undefined,
        },
      } as BlogEntity;
    })
    .filter(Boolean) as BlogEntity[];
}

type BlogLoose = {
  id: string | number;
  attributes: {
    Title?: string;
    slug?: string;
    publish_date?: string | null;
    coverImg?: {
      data?: { attributes?: { url?: string; alternativeText?: string } };
    };
    blog_categories?: { data: Array<{ attributes?: { title?: string } }> };
  };
};

type AuthorAttributes = {
  Name: string;
  Name_Slug: string;
  Designation?: string;
  Bio?: string;
  AltText?: string;
  LinkedinLink?: string;
  TwitterLink?: string;
  Image?: {
    data?: { attributes?: { url?: string; alternativeText?: string } };
  };
  sunrise_blogs?: { data: BlogLoose[] };
};
type AuthorData = { id: string | number; attributes: AuthorAttributes };

type DoctorAttributes = {
  Name: string;
  Name_Slug: string;
  DoctorBio?: string | null;
  Image?: {
    data?: { attributes?: { url?: string; alternativeText?: string } };
  };
  LinkedinLink?: string;
  TwitterLink?: string;
  sunrise_blogs?: { data: BlogLoose[] };
};
type DoctorData = { id: string | number; attributes: DoctorAttributes };

interface PageProps {
  person: 'author' | 'doctor';
  authorData: AuthorData | null;
  doctorData: DoctorData | null;
  blogsData: BlogsData;
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
  searchData: Blog[];
}

const WriterDetailsSection: React.FC<{ authorData: AuthorData, shareLinkdein: any, shareTwitter: any }> = ({
  authorData, shareLinkdein, shareTwitter
}) => (
  <div className="relative mb-10 flex items-center rounded-xl bg-[#F5F5F5] p-8 shadow-sm">
    <div className="mr-6 flex flex-shrink-0 flex-col items-center">
      {/* <Image
        src={
          validateImageUrl(
            authorData.attributes.Image?.data?.attributes?.url,
          ) || '/default-avatar.png'
        }
        alt={authorData.attributes.Name || 'Author'}
        width={120}
        height={120}
        className="rounded-full"
      /> */}
      <CustomImage
        src={
          validateImageUrl(
            authorData.attributes.Image?.data?.attributes?.url,
          ) || '/default-avatar.png'
        }
        alt={authorData.attributes.Name || 'Author'}
        width={120}
        height={120}
        className="rounded-full"
      />
    </div>
    <div className="flex-1">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="mb-2 text-2xl font-bold">{formatTitleCaseName(authorData.attributes.Name)}</h1>
        <div className="flex items-center gap-8 mb-2">
          {authorData?.attributes?.LinkedinLink &&
            <div style={{ height: '32px', width: '32px' }} onClick={() => shareLinkdein(authorData?.attributes?.LinkedinLink)}
              data-title=" inkedIn"
              className="shareButton cursor-pointer"
            >
              <CustomImage src={LinkedIn} alt="LinkedIn" />
            </div>}
          {authorData?.attributes?.TwitterLink &&
            <div style={{ height: '32px', width: '32px' }} onClick={() => shareTwitter(authorData?.attributes?.TwitterLink)}
              className="shareButton cursor-pointer"
              data-title="Twitter"
            >
              <CustomImage
                src={XShare}
                alt="Twitter"
                width={32}
                height={32}
              />
            </div>
          }
        </div>
      </div>

      {authorData.attributes.Bio && (
        <p className="mb-4 text-gray-700">{authorData.attributes.Bio}</p>
      )}
    </div>
  </div >
);

const DoctorDetailsSection: React.FC<{ doctorData: DoctorData, shareTwitter: any, shareLinkdein: any }> = ({
  doctorData, shareTwitter, shareLinkdein
}) => (
  <div className="relative mb-10 flex items-center rounded-xl bg-[#F5F5F5] p-8 shadow-sm">
    <div className="mr-6 flex flex-shrink-0 flex-col items-center">
      {/* <Image
        src={
          validateImageUrl(
            doctorData.attributes.Image?.data?.attributes?.url,
          ) || '/default-avatar.png'
        }
        alt={doctorData.attributes.Name || 'Doctor'}
        width={120}
        height={120}
        className="rounded-full"
      /> */}
      <CustomImage
        src={
          validateImageUrl(
            doctorData.attributes.Image?.data?.attributes?.url,
          ) || '/default-avatar.png'
        }
        alt={doctorData.attributes.Name || 'Doctor'}
        width={120}
        height={120}
        className="rounded-full"
      />
    </div>
    <div className="flex-1">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {formatTitleCaseName(doctorData.attributes.Name)}
        </h1>

        <div className="flex items-center gap-8">
          {doctorData?.attributes?.LinkedinLink &&
            <div style={{ height: '32px', width: '32px' }} onClick={() => shareLinkdein(doctorData?.attributes?.LinkedinLink)}
              data-title="LinkedIn"
              className="shareButton cursor-pointer"
            >
              <CustomImage src={LinkedIn} alt="LinkedIn" />
            </div>}
          {doctorData?.attributes?.TwitterLink &&
            <div style={{ height: '30px', width: '32px' }} onClick={() => shareTwitter(doctorData?.attributes?.TwitterLink)}
              className="shareButton cursor-pointer"
              data-title="Twitter"
            >
              <CustomImage
                src={XShare}
                alt="Twitter"
              // width={32}
              // height={32}
              />
            </div>
          }
        </div>
      </div>

      {doctorData.attributes.DoctorBio && (
        <p className="text-gray-700">{doctorData.attributes.DoctorBio}</p>
      )}
    </div>

  </div >
);

const PersonPage: React.FC<PageProps> = ({
  person,
  authorData,
  doctorData,
  blogsData,
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
}) => {
  const isDoctor = person === 'doctor';
  const [currentUrl, setCurrentUrl] = useState('');

  const personName = isDoctor
    ? doctorData?.attributes?.Name
    : authorData?.attributes?.Name;
  const pageTitle = personName
    ? `${personName} - ${isDoctor ? 'Doctor' : 'Author'}`
    : isDoctor
      ? 'Doctor Profile'
      : 'Author Profile';
  const pageDescription = isDoctor
    ? doctorData?.attributes?.DoctorBio || ''
    : authorData?.attributes?.Bio || '';

  if (!authorData && !doctorData) {
    return (
      <PageBase
        title="Not Found"
        description="The requested page could not be found"
        initialMenus={initialMenus}
        initialBottomMenus={initialBottomMenus}
        initialSocials={initialSocials}
        searchData={searchData}
      >
        <div className="mt-10 text-center text-gray-500">Not found</div>
      </PageBase>
    );
  }


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const shareOnTwitter = (shareUrl: string) => {

    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'width=600,height=300');
    }
  };

  const shareLinkdein = (shareUrl: string) => {
    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'width=600,height=300');
    }
  }
  return (
    <PageBase
      title={pageTitle}
      description={pageDescription}
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      initialSocials={initialSocials}
      searchData={searchData}
    >
      <div className="relative">
        <div className="container mt-8">
          {isDoctor ? (
            doctorData ? (
              <DoctorDetailsSection doctorData={doctorData} shareTwitter={shareOnTwitter} shareLinkdein={shareLinkdein} />
            ) : null
          ) : authorData ? (
            <WriterDetailsSection authorData={authorData} shareLinkdein={shareLinkdein} shareTwitter={shareOnTwitter} />
          ) : null}
        </div>

        <div className="container sticky top-[120px] z-10">
          <TabNavigationAnimation
            label={isDoctor ? 'Reviewed By' : 'Written By'}
          />
        </div>

        <div className="container mt-6">
          {isDoctor ? (
            <AuthorPageBlogList
              doctorBlogsData={blogsData}
              combined
              hideTitles
              perPageData={9}
            />
          ) : (
            <AuthorPageBlogList
              authorBlogsData={blogsData}
              combined
              hideTitles
              perPageData={9}
            />
          )}
        </div>
      </div>
    </PageBase>
  );
};

export default PersonPage;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const personRaw = String(context.params?.person || '').toLowerCase();
    const name_slug = String(context.params?.name_slug || '');

    const person = personRaw === 'doctor' ? 'doctor' : 'author';

    let authorData: AuthorData | null = null;
    let doctorData: DoctorData | null = null;
    let blogsData: BlogsData = { blogs: { data: [] } };

    try {
      if (person === 'author') {
        const res = await getSingleAuthorService(name_slug);
        authorData = ((res?.data as any)?.sunriseClubAuthors?.data?.[0] ??
          null) as AuthorData | null;
        const raw = authorData?.attributes?.sunrise_blogs?.data ?? [];
        blogsData = { blogs: { data: toBlogEntities(raw) } };
      } else {
        const res = await getSingleDoctorService(name_slug);
        doctorData = ((res?.data as any)?.sunriseDoctors?.data?.[0] ??
          null) as DoctorData | null;
        const raw = doctorData?.attributes?.sunrise_blogs?.data ?? [];
        blogsData = { blogs: { data: toBlogEntities(raw) } };
      }
    } catch {
      // keep defaults
    }

    return {
      props: {
        person,
        authorData,
        doctorData,
        blogsData,
      },
    };
  },
);
