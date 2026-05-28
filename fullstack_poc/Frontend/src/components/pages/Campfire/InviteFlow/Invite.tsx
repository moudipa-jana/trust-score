import { useLazyQuery } from '@apollo/client/react';
import { capitalize, debounce } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RxCross1 } from 'react-icons/rx';

import Gmail from '/public/images/gmail.svg';
import Telegram from '/public/images/telegram.svg';
import Twitter from '/public/images/twitter.svg';
import userImage from '/public/images/userImage.svg';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Input from '@/elements/Input';
import Text from '@/elements/Text';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import { GET_USERBY_NAME } from '@/service/graphql/Campfire';
import { InviteUser } from '@/types/campfire';
import { getUserToken } from '@/utils/verifyAuthentication';
interface SelectedUsers {
  id: string;
  name: string;
}
interface IInvite {
  nextStep: () => void;
  campfireId: string;
  setSelectedUser: Dispatch<SetStateAction<SelectedUsers[]>>;
  selectedUser: SelectedUsers[];
}

function Invite({
  nextStep,
  campfireId,
  setSelectedUser,
  selectedUser,
}: IInvite) {
  const { query } = useRouter();
  const [searchUser, setSearchUser] = useState('');
  const [usersData, setUsersData] = useState<InviteUser[]>([]);
  const token = getUserToken();
  const [getUsers, { data }] = useLazyQuery(GET_USERBY_NAME, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if ((data as any)?.get_campfire_invite_users) {
      setUsersData((data as any).get_campfire_invite_users);
    }
  }, [data]);
  const handleCopiedData = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const link = encodeURI(
        `${window.location.origin}/campfire/${query.name}`,
      );
      navigator.clipboard.writeText(`${link}`);
      emitNotification('success', 'Text copied to clipboard!');
    }
  };
  const VerifyUserName = useCallback(
    async (name: string) => {
      try {
        await getUsers({
          variables: { name, campfireId },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
      } catch (err) {
        emitErrorNotification(capitalize(formatGraphqlError(err)));
      }
    },
    [getUsers, campfireId, token],
  );

  const debounceUserName = useMemo(() => {
    return debounce(VerifyUserName, 400);
  }, [VerifyUserName]);

  const handleSearchUserName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const searchValue = e.target.value.toLowerCase();
      setSearchUser(searchValue);
      if (searchValue.includes('\\')) {
        emitErrorNotification('Please enter a valid search term.');
        return;
      }
      if (e.type === 'focus') {
        VerifyUserName(searchValue);
      } else if (e.type === 'change') {
        debounceUserName(searchValue);
      }
    },
    [VerifyUserName, debounceUserName],
  );
  const handleUserSelect = (userId: string, userName: string) => {
    setSelectedUser((prevState) => {
      const updatedMembers: SelectedUsers[] = [...prevState];
      const index = updatedMembers.findIndex((value) => value?.id === userId);
      if (index === -1) {
        updatedMembers.push({
          id: userId,
          name: userName,
        });
      } else {
        updatedMembers.splice(index, 1);
      }
      return updatedMembers;
    });
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUser((prevState) => {
      return prevState.filter((value) => value?.id !== userId);
    });
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownProfile, setDropdownProfile] = useState(true);

  useEffect(() => {
    const handleOutsideClick = (event: globalThis.MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !(dropdownRef.current as HTMLElement).contains(event.target)
      ) {
        setDropdownProfile(false);
      } else {
        setDropdownProfile(true);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownProfile, dropdownRef]);

  return (
    <div>
      <Text size="lg">Invite others to your campfire!</Text>
      <div className="py-4">
        <Text size="sm">Name</Text>

        {/* Selected Users Pills */}
        {selectedUser?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedUser?.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-2 rounded-full border border-primary bg-white px-3 py-1 text-primary"
              >
                <Text size="sm" font="font-semibold">
                  {user.name}
                </Text>
                <RxCross1
                  size={10}
                  className="cursor-pointer font-semibold hover:text-red-500"
                  onClick={() => handleRemoveUser(user.id)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          <Input
            value={searchUser}
            placeholder="Search by name"
            onChange={handleSearchUserName}
            onFocus={handleSearchUserName}
          />
          {usersData[0] ? (
            <div
              className={` dropdownMenu h-48 ${
                dropdownProfile ? 'showList' : ''
              } `}
            >
              <ul>
                {usersData.map((user: InviteUser) => {
                  return (
                    <li
                      key={user.id}
                      className="my-2 flex items-center justify-start"
                    >
                      <div className="p-2">
                        <input
                          type="checkbox"
                          name=""
                          id=""
                          checked={selectedUser?.some(
                            (u) => u?.id === user?.id,
                          )}
                          onChange={() =>
                            handleUserSelect(user?.id, user?.name)
                          }
                        />
                      </div>
                      <div className="mr-2 h-10 w-10 rounded-full ">
                        <CustomImage
                          width={50}
                          height={50}
                          src={user.profilepicture}
                          fallbackSrc={userImage}
                        ></CustomImage>
                      </div>
                      <Text>{user.name}</Text>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : searchUser ? (
            <div
              className={` dropdownMenu h-16 ${
                dropdownProfile ? 'showList' : ''
              } `}
            >
              <div className="flex h-full items-center justify-center">
                <Text size="sm" color="text-red-600">
                  No such user found !
                </Text>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="py-8">
        <Text size="sm">Share via</Text>
        <div className="flex items-center justify-evenly p-2">
          <div>
            <Link
              target="_blank"
              href={encodeURI(
                `https://mail.google.com/mail/u/0/?tf=cm&to=%22+++emailTo)+:+%22%22)(%22&su=Checkout Kofuku Social&body=Hey, Checkout the Campfire I found on Kofuku Social. Here is the link ${window.location.origin}/campfire/${query.name}`,
              )}
            >
              <div className="h-10 w-14 ">
                <CustomImage src={Gmail} />
                <div className="py-2">
                  <Text size="xs">Gmail</Text>
                </div>
              </div>
            </Link>
          </div>
          <div>
            <Link
              target="_blank"
              href={encodeURI(
                `https://twitter.com/intent/tweet?text=Hey, Checkout the Campfire I found on Kofuku Social.&url=${window.location.origin}/campfire/${query.name}`,
              )}
            >
              <div className="h-10 w-14 ">
                <CustomImage src={Twitter} />
                <div className="py-2">
                  <Text size="xs">Twitter</Text>
                </div>
              </div>
            </Link>
          </div>
          <div>
            <Link
              target="_blank"
              href={encodeURI(
                `https://telegram.me/share/url?url=${window.location.origin}/campfire/${query.name}&text=Hey, Checkout the Campfire I found on Kofuku Social.`,
              )}
            >
              <div className="h-10 w-14 ">
                <CustomImage src={Telegram} />
                <div className="py-2">
                  <Text size="xs">Telegram</Text>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div>
        <Text size="sm">Copy Link</Text>
        <Input
          value={`${window.location.origin}/campfire/${query.name}`}
          isIcon
          onCopy={handleCopiedData}
        />
      </div>
      <div className="py-8">
        <Button
          type={selectedUser ? '' : 'light'}
          block
          isdisabled={!selectedUser[0]}
          onClick={nextStep}
        >
          Preview
        </Button>
      </div>
    </div>
  );
}

export default Invite;
