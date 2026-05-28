/**
 * CategorySignup component allows users to select their areas of interest by clicking on tags
 * representing different categories. It fetches categories using a lazy GraphQL query
 * and displays them as clickable tags. Additionally, if a specific category containing 18+ content is selected,
 * a warning is displayed.
 */

import { useLazyQuery } from '@apollo/client/react';
import { capitalize, get } from 'lodash';
import { useEffect, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { RiErrorWarningLine } from 'react-icons/ri';

import leftArrow from '/public/images/ShapeleftArrow.svg';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Tag from '@/components/Utility/Tag';
import Text from '@/elements/Text';
import { emitErrorNotification } from '@/lib/helpers';
import { QUERY_GET_CATEGORIES } from '@/service/graphql/Category';
import Label from '@/elements/Label';
import SignupHeader from './SignupHeader';

interface Category {
  id: string;
  title: string;
}

interface CategorySignupProps {
  isCampfire?: boolean;
  handleSubmit: (skip?: boolean) => void;
  interest: string[];
  setInterest: React.Dispatch<React.SetStateAction<string[]>>;
  updateError?: string;
  submitLoading: boolean;
  back?: () => void;
}

function CategorySignup({
  handleSubmit,
  isCampfire,
  interest,
  setInterest,
  updateError,
  submitLoading,
  back,
}: CategorySignupProps) {
  const [showAgePrompt, setShowAgePrompt] = useState(false);
  const [fetchCategories, { data: categoryData, error: categoryError }] =
    useLazyQuery(QUERY_GET_CATEGORIES);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    return () => {
      setInterest([]); // ✅ reset when component unmounts
    };
  }, []);

  useEffect(() => {
    if (categoryError?.message) {
      emitErrorNotification(categoryError?.message);
    }
  }, [categoryError?.message]);

  const handleCategorySelect = (category: Category) => {
    setInterest((ids: string[]) =>
      ids.includes(category.id)
        ? ids.filter((n: string) => n !== category.id)
        : [category.id, ...ids],
    );
  };

  useEffect(() => {
    const categories: Category[] = get(categoryData, 'categories', []);
    const hasAgeRestricted = categories.some(
      (cat) =>
        interest.includes(cat.id) &&
        (cat.title.toLowerCase().includes('hush talks') ||
          cat.title.toLowerCase().includes('she read') ||
          cat.title.toLowerCase().includes('she reads')),
    );
    setShowAgePrompt(hasAgeRestricted);
  }, [interest, categoryData]);

  return (
    <div className={`${isCampfire ? 'pt-8' : 'pt-0'} h-full p-3`}>
      {/* <button className="modal-back-close absolute left-3 top-0" onClick={back}>
        <svg
          width="18"
          height="17"
          viewBox="0 0 18 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.29546 0.783953C7.68887 0.396332 8.32202 0.40102 8.70964 0.794426C9.09726 1.18783 9.09257 1.82098 8.69917 2.2086L3.32881 7.5H17C17.5523 7.5 18 7.94772 18 8.5C18 9.05229 17.5523 9.5 17 9.5H3.33542L8.69917 14.7849C9.09257 15.1725 9.09726 15.8057 8.70964 16.1991C8.32202 16.5925 7.68887 16.5972 7.29546 16.2095L0.371273 9.38715C-0.125641 8.89754 -0.125641 8.09595 0.371273 7.60634L7.29546 0.783953Z"
            fill="#737373"
          />
        </svg>
      </button> */}
      <SignupHeader type="signup" />
      <Label
        title="Select your areas of interests"
        variant
        color="text-black-200 text-md mb-4"
      />
      <div className="pt-4">
        <div className="flex flex-wrap gap-4">
          {get(categoryData, 'categories', []).map((ele: Category) => {
            return (
              <div
                className="cursor-pointer "
                key={ele.id}
                onClick={() => handleCategorySelect(ele)}
              >
                <Tag
                  type="chips"
                  size="sm"
                  rounded
                  isActive={
                    interest?.find(
                      (id: string) => id === ele.id,
                    ) as unknown as boolean
                  }
                >
                  {capitalize(ele.title)}
                </Tag>
              </div>
            );
          })}
        </div>
      </div>
      {updateError && (
        <div className="flex items-center py-2">
          <div className="mr-1 text-error">
            <FaExclamationCircle />
          </div>
          <Text color="text-error" size="sm">
            {updateError}
          </Text>
        </div>
      )}
      {showAgePrompt && (
        <div className="mt-6 flex space-x-2">
          <div className="max-w-20">
            <RiErrorWarningLine color="red" size={22} />
          </div>
          <Text color="text-pink-1050" size="sm">
            This category contains 18+ content. By clicking Next, you consent to
            the content in the category.
          </Text>
        </div>
      )}
      {isCampfire ? (
        <Button type="secondary " block>
          Add
        </Button>
      ) : (
        <div className="mt-6 flex  justify-end">
          {/* <div
            className="mr-2 flex cursor-pointer items-center justify-end p-2 text-sm"
            onClick={() => handleSubmit(true)}
          >
            <Text size="base">Skip</Text>
            <div className="p-2">
              <div>
                <CustomImage src={leftArrow} alt="leftArrow" />
              </div>
            </div>
          </div> */}
          <Button
            isLoading={submitLoading}
            isdisabled={submitLoading}
            customClassName='w-full'
            onClick={() => handleSubmit()}
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}

export default CategorySignup;
