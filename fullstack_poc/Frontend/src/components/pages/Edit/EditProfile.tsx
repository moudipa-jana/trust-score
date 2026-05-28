import { useLazyQuery } from '@apollo/client/react';
import { capitalize, debounce } from 'lodash';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

import Input from '@/elements/Input';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { formatGraphqlError } from '@/lib/helpers';
import validations from '@/lib/validations';
import { FETCH_USER_BY_NAME_QUERY } from '@/service/graphql/Auth';
import { selectGetToken } from '@/state/Slices/auth';
import { editProfileDetailsType } from '@/types/profile';

interface IEditProfileName {
  displayName: string;
  setEditProfileDetails: Dispatch<SetStateAction<editProfileDetailsType>>;
  setDisplayNameError: Dispatch<SetStateAction<string>>;
  displayNameError: string;
}
function EditProfileName({
  displayName,
  setEditProfileDetails,
  setDisplayNameError,
  displayNameError,
}: IEditProfileName) {
  const [remainingCharCount, setRemainingCharCount] = useState(
    validations.getRemainingCharOrWordCount(displayName, 30),
  );
  const token = useAppSelector(selectGetToken);
  const [verifyName] = useLazyQuery(FETCH_USER_BY_NAME_QUERY);
  const [characterError, setCharacterErrors] = useState<string | undefined>();

  const VerifyDisplayName = useCallback(
    async (name: string) => {
      try {
        const EVERYONE = 'everyone';
        if (name.toLowerCase().trim() !== EVERYONE) {
          const { data } = await verifyName({
            variables: { name },
            context: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          });
          const isNameTaken = (data as any)?.users?.length > 0;

          if (isNameTaken) {
            setDisplayNameError(`${name} is already in use`);
          } else {
            setDisplayNameError('');
          }
        } else {
          setDisplayNameError("Everyone can't be an alias name");
        }
      } catch (err) {
        const formattedError = formatGraphqlError(err);
        setDisplayNameError(capitalize(formattedError));
      }
    },
    [verifyName, setDisplayNameError, token],
  );

  const debounceVerifyName = useMemo(() => {
    return debounce(VerifyDisplayName, 400);
  }, [VerifyDisplayName]);

  const handleDisplayNameChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const nameVal = e.target.value;
    const filteredName = nameVal.replace(/[^a-zA-Z0-9\s_-]/g, '');

    const charCount = validations.getRemainingCharOrWordCount(nameVal, 30);

    if (charCount >= 0) {
      setRemainingCharCount(charCount);

      if (nameVal !== filteredName) {
        setCharacterErrors(
          'Only letters, numbers, spaces, underscores (_), and hyphens (-) are allowed.',
        );
      } else {
        // Clear character error if input is valid
        if (
          characterError ===
          'Only letters, numbers, spaces, underscores (_), and hyphens (-) are allowed.'
        ) {
          setCharacterErrors("");
        }
      }

      if (nameVal.length <= 30) {
        // Don't trim during typing, only remove leading spaces for verification
        const nameForVerification = nameVal.replace(/^\s+/, '');
        debounceVerifyName(nameForVerification);

        setEditProfileDetails((prevState) => {
          return {
            ...prevState,
            name: nameVal, // Keep the original input value
          };
        });
      } else {
        // Only trim when character limit is reached
        const trimmedNameVal = nameVal.slice(0, 30).replace(/\s+(\S+)?$/, '');
        debounceVerifyName(trimmedNameVal);
        setEditProfileDetails((prevState) => {
          return {
            ...prevState,
            name: trimmedNameVal,
          };
        });
      }
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-4 ">
        <Text size="sm">Display Name</Text>
        <Text size="xs" color="text-gray-700">
          (Avoid using your own name as display name)
        </Text>
      </div>
      <div className="">
        <Input
          type="text"
          value={displayName}
          onChange={handleDisplayNameChange}
        />
        <div>
          <Text size="xs" color="text-error">
            {displayNameError}
          </Text>
          {characterError && (<Text size="xs" color="text-error">
            {characterError}
          </Text>)}


        </div>
        <div className="pt-1 text-right">
          <Text size="xs" color="text-gray-700">
            Max {30 - remainingCharCount}/30 characters
          </Text>
        </div>
      </div>
    </div>
  );
}

export default EditProfileName;
