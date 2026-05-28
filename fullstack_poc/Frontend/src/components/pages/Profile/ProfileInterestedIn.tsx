import InterestedInIcon from 'public/images/InterestedIn.svg';
import React from 'react';

import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';

interface Interest {
  category: {
    title: string;
  };
}

interface ProfileInterestedInProps {
  userInterestedData?: Interest[];
  isGuestUser?: boolean;
  isDisabled?: boolean;
}

function ProfileInterestedIn({
  userInterestedData,
  isGuestUser = false,
  isDisabled,
}: ProfileInterestedInProps) {
  const ismobile = useIsMobile();

  return (
    <div
      className={`${ismobile ? 'mb-2 pb-2' : 'mt-2'} ${
        isDisabled ? 'blur-sm' : ''
      } `}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '6px',
          alignItems: 'center',
        }}
      >
        <Text>
          <p className="pt-1 text-base">Interested in</p>
        </Text>
        <div style={{ height: '16px', width: '16px' }}>
          <CustomImage src={InterestedInIcon} />
        </div>
      </div>

      {(userInterestedData?.length ?? 0) !== 0 ? (
        <div
          style={{
            display: 'flex',
            gap: '3px',
            flexWrap: 'wrap',
            marginTop: '2px',
            maxHeight: '200px',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#888 #f1f1f1',
          }}
        >
          {userInterestedData?.map((interest: Interest) =>
            interest.category && interest.category.title ? (
              <span
                key={interest.category.title}
                className="mr-2 mb-1 rounded-full border px-2 capitalize"
                style={{
                  color: '#707070',
                  borderColor: '#CBD5E0',
                  fontSize: ismobile ? '14px' : '16px',
                }}
              >
                {interest.category.title}
              </span>
            ) : null,
          )}
        </div>
      ) : (
        <Text>
          <p className="pt-1 text-base">
            {`${isGuestUser ? "Hasn't" : "Haven't"}` +
              ' selected any category yet'}
          </p>
        </Text>
      )}
    </div>
  );
}

export default ProfileInterestedIn;
