/**
 * FollowButton handles follow/unfollow logic for a user.
 * - Prevents self-follow
 * - Auth-gated (triggers signup if unauthenticated)
 * - Updates UI based on Redux state
 */
import { isEmpty } from 'lodash';
import { memo, MouseEvent, useEffect, useRef, useState } from 'react';

import { followUser, unFollowUser } from '@/actions/auth';
import Button from '@/components/Utility/Button';
import Text from '@/elements/Text';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';

interface FollowingButtonProps {
  postUserId: string;
  isFollowing?: boolean;
  showFullButton?: boolean;
  isCampfire?: boolean;
}

function FollowButton({
  postUserId,
  isFollowing,
  showFullButton,
  isCampfire,
}: FollowingButtonProps) {
  const token = useAppSelector((state) => state.auth.token);
  const profile = useAppSelector((state) => state.auth.profile);
  const userFollowings = useAppSelector(
    (state) => state.auth.userFollowings || [],
  );
  const blockerIds = useUsersWhoBlockedMe();

  const dispatch = useAppDispatch();
  const [follow, setFollow] = useState(isFollowing);
  const initialRenderRef = useRef(true);
  const lastClickTimeRef = useRef(0);
  const DEBOUNCE_DELAY = 500; // 500ms delay

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
    } else {
      const owner = userFollowings.find((x) => x && x.id === postUserId);
      setFollow(owner ? true : false);
    }
  }, [userFollowings, postUserId]);

  const onFollowClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    // Prevent multiple rapid clicks with debouncing
    const now = Date.now();
    if (now - lastClickTimeRef.current < DEBOUNCE_DELAY) {
      return;
    }
    lastClickTimeRef.current = now;
    if (!token || isEmpty(profile)) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    if (!follow) {
      dispatch(followUser(postUserId, profile.id, token));
      setFollow(true);
    } else {
      dispatch(unFollowUser(postUserId, profile.id, token));
      setFollow(false);
    }
  };
  if (profile?.id === postUserId || blockerIds.has(postUserId)) {
    return null;
  }

  return (
    <div className={`followBtnStyle ${isCampfire ? 'mb-8' : ''}`}>
      <Button
        type={!follow ? '' : 'secondary'}
        textColor="text-primary"
        size="xs"
        onClick={(e: MouseEvent<HTMLElement>) => onFollowClick(e)}
        customClassName={showFullButton ? 'w-full' : ''}
      >
        <Text customClass="!text-xxs xl:!text-sm font-semibold" size="base">
          {!follow ? 'Follow' : 'Following'}
        </Text>
      </Button>
    </div>
  );
}

export default memo(FollowButton);
