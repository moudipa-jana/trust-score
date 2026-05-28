import {
  BlockedUserText,
  ProfileActivityErrorComponent,
} from '@/components/pages/Profile/ProfileActivities';
import Dropdown from '@/components/Utility/Dropdown';
import { useAppSelector } from '@/Hooks/useRedux';
import { getGuestUserBlockedStatus } from '@/state/Slices/profile';
import { activitiesProfileOption } from '@/types/profile';

interface IGuestUserPostRender {
  profileOptions: activitiesProfileOption[];
  setSelectedOption: React.Dispatch<
    React.SetStateAction<activitiesProfileOption>
  >;
  selectedOption: activitiesProfileOption;
  count: number;
  children: React.ReactNode;
  header?: React.ReactNode;
}
const GuestUserPostRender = ({
  profileOptions,
  setSelectedOption,
  selectedOption,
  count,
  children,
  header,
}: IGuestUserPostRender) => {
  const isUserBlocked = useAppSelector(getGuestUserBlockedStatus);
  return (
    <>
      <div className="mt-4 max-w-[230px] cursor-pointer">
        <Dropdown
          options={profileOptions}
          isLabel
          onChange={(value) =>
            setSelectedOption(value as activitiesProfileOption)
          }
          color="border-primary"
          rounded
          defaultOption={selectedOption}
        />
      </div>
      <div>
        {isUserBlocked ? (
          <BlockedUserText header={header} />
        ) : count ? (
          <div>{children}</div>
        ) : (
          <div className="layout flex flex-col items-center justify-center gap-3 text-center">
            <ProfileActivityErrorComponent errorMessage="No Posts Found" />
            <p className='text-sm font-bold text-gray-500'>
              No result found
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default GuestUserPostRender;
