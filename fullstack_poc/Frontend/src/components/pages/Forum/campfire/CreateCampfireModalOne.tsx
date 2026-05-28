import { useLazyQuery, useQuery } from '@apollo/client/react';
import { capitalize, debounce, get, isEmpty, startCase } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

import Button from '@/components/Utility/Button';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Tag from '@/components/Utility/Tag';
import Heading from '@/elements/Heading';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import Text from '@/elements/Text';
import TextArea from '@/elements/TextArea';
import useIsMobile from '@/Hooks/useIsMobile';
import { formatGraphqlError } from '@/lib/helpers';
import validations from '@/lib/validations';
import { VALIDATE_CAMPFIRE_NAME } from '@/service/graphql/Campfire';
import { QUERY_GET_CATEGORIES } from '@/service/graphql/Category';

interface CreateCampfireModalOneProps {
  nextStep: () => void;
  category: string;
  setCategory: (categoryId: string) => void;
  campfireName: string;
  setCampfireName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
}

interface Category {
  id: string;
  title: string;
}

const CreateCampfireModalOne = ({
  nextStep,
  category,
  setCategory,
  campfireName,
  setCampfireName,
  description,
  setDescription,
}: CreateCampfireModalOneProps) => {
  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
  } = useQuery(QUERY_GET_CATEGORIES);

  const [titleError, setTitleError] = useState('');
  const [verifyName] = useLazyQuery(VALIDATE_CAMPFIRE_NAME, {
    fetchPolicy: 'no-cache',
  });
  const isMobile = useIsMobile();
  const [showAgePrompt, setShowAgePrompt] = useState(false);
  const [remainingCharCount, setRemainingCharCount] = useState(30);
  const [remainingDescriptionCharCount, setRemainingDescriptionCharCount] =
    useState(500);

  const handleCategorySelect = (selectedCategory: Category) => {
    setShowAgePrompt(
      selectedCategory?.title?.toLowerCase().includes('hush talk') ||
      selectedCategory?.title?.toLowerCase().includes('she read'),
    );
    setCategory(selectedCategory.id);
  };

  const VerifyCampfireName = useCallback(
    async (title: string) => {
      try {
        const res = await verifyName({ variables: { title } });
        if (res) {
          if ((res.data as any).campfireExists.aggregate.count) {
            setTitleError('Campfire with this name already exists.');
          } else {
            setTitleError(' ');
          }
        }
      } catch (err) {
        setTitleError(capitalize(formatGraphqlError(err)));
      }
    },
    [verifyName],
  );

  const debounceVerifyName = useMemo(() => {
    return debounce(VerifyCampfireName, 400);
  }, [VerifyCampfireName]);

  const handleTitleChange = (name: string) => {
    const leftTrimmed = name.trimStart();

    // If input is only spaces, set empty string
    if (!leftTrimmed) {
      setCampfireName('');
      setRemainingCharCount(30);
      return;
    }

    // Calculate remaining characters based on trimmed input
    const charCount = validations.getRemainingCharOrWordCount(leftTrimmed, 30);

    if (charCount >= 0) {
      setRemainingCharCount(charCount);

      // If length exceeds 30, truncate to 30 chars
      if (leftTrimmed.length > 30) {
        setCampfireName(leftTrimmed.slice(0, 30));
      } else {
        setCampfireName(leftTrimmed);
      }

      // Only verify name if length > 3
      if (leftTrimmed.length > 3) {
        debounceVerifyName(leftTrimmed);
      }
    }
  };

  const handleDescriptionChange = (name: string) => {
    // Restrict to exactly 500 characters including spaces
    if (name.length > 500) {
      return; // Don't allow typing beyond 500 characters
    }

    setDescription(name);

    // Calculate remaining characters
    const remainingChars = 500 - name.length;
    setRemainingDescriptionCharCount(remainingChars);
  };

  return (
    <div>
      <div className="relative z-20">
        <div className="animated fadeIn faster campfire-modal pt-4">
          <Heading priority={3} variant font="font-medium">
            Create a Campfire
          </Heading>
          <div className="pb-2">
            <Text size="base" font="font-light">
              Be unique and let the healthy times roll!
            </Text>
          </div>
          <Label title="Name" required />
          <div className="mt-2">
            <Input
              autoFocus
              placeholder="Title"
              required
              type="text"
              name="campfireName"
              value={campfireName}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) => handleTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  e.preventDefault();
                }
              }}
            />
            <Text size="xs" color="text-gray-700">
              Spaces are not allowed
            </Text>
            <div className="flex w-full justify-between">
              <Text size="xs" color="text-error">
                {titleError}
              </Text>
              <div>
                <Text size="xs" color="text-gray-700">
                  Max {30 - remainingCharCount}/30 characters
                </Text>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="mt-2 flex">
            <Label title="Brief Description" />
            <p className="ml-1">(Optional)</p>
          </div>
          <div className="mt-2">
            <TextArea
              placeholder="Description"
              name="Description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleDescriptionChange(e.target.value)
              }
            />
            <div className="text-right">
              <Text size="xs" color="text-gray-700">
                Max {500 - remainingDescriptionCharCount}/500 characters
              </Text>
            </div>
          </div>
        </div>
        {isMobile ? (
          <Text size="lg">Explore by area of interest</Text>
        ) : (
          <Text size="xl">Explore by area of interest</Text>
        )}

        <div className="pb-2">
          <Text size="base" color="text-black-200" font="font-light">
            Trending topics
          </Text>
          <div className="flex flex-wrap gap-4 py-4">
            {categoryLoading ? (
              <div className="mx-auto">
                <TabletLoader style={{ height: 100 }} />
              </div>
            ) : !isEmpty(categoryData) && !categoryError ? (
              get(categoryData, 'categories', []).map((ele: Category) => {
                return (
                  <div
                    className="z-20 cursor-pointer"
                    key={ele.id}
                    onClick={() => handleCategorySelect(ele)}
                  >
                    <Tag
                      type="chips"
                      size="sm"
                      rounded
                      isActive={ele.id === category}
                    >
                      {startCase(ele.title)}
                    </Tag>
                  </div>
                );
              })
            ) : (
              <div className="flex h-36 flex-wrap gap-4 py-8 text-error">
                <Text size="base">
                  Oops, something went wrong while fetching categories.
                </Text>
              </div>
            )}
          </div>
        </div>
        {showAgePrompt && (
          <div className="my-2 flex space-x-2">
            <div className="max-w-20">
              <RiErrorWarningLine color="red" size={22} />
            </div>
            <Text color="text-pink-1050" size="sm">
              This category contains 18+ content. By clicking Continue, you
              consent to the content in the category.
            </Text>
          </div>
        )}
        <div>
          <Button
            type="primary"
            block
            isdisabled={
              !(
                campfireName.trim().length > 0 &&
                campfireName.trim().length <= 30 &&
                titleError !== 'Campfire with this name already exists.'
              ) || !category
            }
            onClick={nextStep}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCampfireModalOne;
