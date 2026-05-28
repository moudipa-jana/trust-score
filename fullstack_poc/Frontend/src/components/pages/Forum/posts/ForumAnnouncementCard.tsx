import { useState } from 'react';

import Comments from '@/components/Utility/Comments';
import CustomImage from '@/components/Utility/CustomImage';
import ForumCard from '@/components/Utility/ForumCard';
import useIsMobile from '@/Hooks/useIsMobile';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { CommentType, PostReaction, UserThreadType } from '@/types/forum';

import bubble from '../../../../../public/images/bubbles.png';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  user: UserThreadType;
  scheduled_at?: string;
  createdAt: string;
  noComments: number;
  noParticipants: number;
  campfire?: {
    id: string;
    title: string;
  };

  campfireName?: string;
  post_reactions?: PostReaction[];
  likes?: number;
  comments?: CommentType[];
}

interface AnnouncementCardProps {
  announcementsData: Announcement[];
  footerDisable?: boolean;
  threadId?: string;
  hideFooter?: boolean;
  searchedPost?: boolean;
  isProfilePage?: boolean;
  index?: number;
  pollReactions?: PostReaction[];
  isActivityLog?: boolean;
  reactionName?: string;
  announcementPage?: boolean;
}

// Wrapper component for individual announcement card
function AnnouncementCardWrapper({
  announcement,
  footerDisable,
  threadId,
  hideFooter,
  searchedPost,
  isProfilePage,
  index,
  pollReactions,
  isActivityLog,
  reactionName,
  announcementPage,
}: {
  announcement: Announcement;
  footerDisable?: boolean;
  threadId?: string;
  hideFooter?: boolean;
  searchedPost?: boolean;
  isProfilePage?: boolean;
  index?: number;
  pollReactions?: PostReaction[];
  isActivityLog?: boolean;
  reactionName?: string;
  announcementPage?: boolean;
}) {
  const isMobile = useIsMobile();
  const [showComments, setShowComments] = useState(announcementPage || false);

  return (
    <div key={announcement?.id} className="relative campfire-card">
      <div
        className={`rounded-xl bg-gradient-to-r  ${isActivityLog ? 'mt-10' : 'mt-16'
          }`}
      >
        <div>
          <div>
            <ForumCard
              postType={PostTypeEnum.question}
              cardType={CardTypeEnum.question}
              admin
              color="bg-[#E0F4FC]"
              postId={announcement?.id}
              id={announcement?.id}
              user={announcement?.user}
              title={announcement?.title}
              description={announcement?.description}
              createdAt={announcement?.scheduled_at || announcement?.createdAt}
              commentsCount={announcement?.noComments}
              participantsCount={announcement?.noParticipants}
              hideActions
              footerDisable={footerDisable}
              isCampfire={Boolean(announcement?.campfire)}
              campfireName={
                announcement?.campfireName ?? announcement?.campfire?.title
              }
              otherLink={
                reactionName
                  ? announcement?.campfire
                    ? `/campfire/${announcement?.campfire?.title}`
                    : '/'
                  : ''
              }
              threadId={threadId}
              hideFooter={hideFooter}
              searchedPost={searchedPost}
              isProfilePage={isProfilePage}
              index={index}
              showComments={showComments}
              toggleComments={setShowComments}
              postReaction={
                pollReactions ? pollReactions : announcement?.post_reactions
              }
              clickableCard={!!reactionName}
              likesCount={announcement?.likes}
              isAnnouncement
              campfireDetails={
                announcement?.campfire
                  ? {
                    ...announcement?.campfire,
                    campfireThreadId: announcement?.id,
                  }
                  : undefined
              }
              reactionName={reactionName}
              authorName={announcement?.user?.name}
            />
          </div>
          <div
            className={`absolute ${isMobile
              ? '-right-3 -bottom-4 h-[28px] w-[42px]'
              : '-right-2 -bottom-[60px] h-[97px] w-[149px]'
              }`}
          >
            {/* <CustomImage alt="PauseButton" src={bubble} /> */}
          </div>
          <div className="thread relative">
            {showComments &&
              announcement?.comments &&
              announcement?.comments[0]?.id && (
                <Comments
                  postUserId={announcement?.user?.id}
                  color="bg-[#E0F4FC]"
                  key={`${JSON.stringify(announcement?.comments || [])}`}
                  postType={PostTypeEnum.question}
                  postId={announcement?.id}
                  comments={announcement?.comments || []}
                  authorName={announcement?.user?.name}
                  isAnnouncementComment
                  announcementPage={announcementPage}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForumAnnouncementCard({
  announcementsData,
  footerDisable,
  threadId,
  hideFooter,
  searchedPost,
  isProfilePage,
  index,
  pollReactions,
  isActivityLog,
  reactionName,
  announcementPage,
}: AnnouncementCardProps) {
  return (
    <div className="relative">
      {announcementsData &&
        announcementsData.map((announcement: Announcement) => (
          <AnnouncementCardWrapper
            key={announcement?.id}
            announcement={announcement}
            footerDisable={footerDisable}
            threadId={threadId}
            hideFooter={hideFooter}
            searchedPost={searchedPost}
            isProfilePage={isProfilePage}
            index={index}
            pollReactions={pollReactions}
            isActivityLog={isActivityLog}
            reactionName={reactionName}
            announcementPage={announcementPage}
          />
        ))}
    </div>
  );
}
