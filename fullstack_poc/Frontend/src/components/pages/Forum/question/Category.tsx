import { startCase } from 'lodash';
import { Dispatch, SetStateAction, use, useEffect, useState } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

import { editPostDetailsType } from '@/components/pages/Forum/forumMenu/EditPostModal';
import Button from '@/components/Utility/Button';
import Tag from '@/components/Utility/Tag';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { getCategories } from '@/state/Slices/necessary';
import { questionSubmitDetailsType } from '@/types/question';

interface ICategory {
  initialCategoryName?: string;
  setQuestionSubmitDetails?: Dispatch<
    SetStateAction<questionSubmitDetailsType>
  >;
  handleSubmit: () => void;
  setEditPostDetails?: Dispatch<SetStateAction<editPostDetailsType>> | null;
  editPostDetails?: editPostDetailsType | null;
  loading?: boolean;
  load?: boolean;
}
function Category({
  initialCategoryName,
  setQuestionSubmitDetails,
  handleSubmit,
  editPostDetails,
  setEditPostDetails,
  loading,
  load,
}: ICategory) {
  const categories = useAppSelector(getCategories);
  const [showAgePrompt, setShowAgePrompt] = useState(false);
  const [selectedCategoryId, setselectedCategoryId] = useState(
    editPostDetails?.categoryId
      ? editPostDetails.categoryId
      : initialCategoryName
        ? categories.find((cat) => cat.title === initialCategoryName)?.id || ''
        : '',
  );

  useEffect(() => {
    if (selectedCategoryId) {
      if (editPostDetails) {
        setEditPostDetails &&
          setEditPostDetails?.((prevState) => ({
            ...prevState,
            description: prevState?.description || '',
            categoryId: selectedCategoryId,
          }));
      } else {
        setQuestionSubmitDetails &&
          setQuestionSubmitDetails?.((prevState) => ({
            ...prevState,
            categoryId: selectedCategoryId,
          }));
      }
    }
  }, [
    load,
    selectedCategoryId,
    // editPostDetails,
    setEditPostDetails,
    setQuestionSubmitDetails,
  ]);

  useEffect(() => {
    if (initialCategoryName) {
      setselectedCategoryId(
        editPostDetails?.categoryId
          ? editPostDetails.categoryId
          : initialCategoryName
            ? categories.find((cat) => cat.title === initialCategoryName)?.id ||
            ''
            : '',
      );
    }
  }, [initialCategoryName]);

  const handleCategorySelect = (selectedCategory: any) => {
    setShowAgePrompt(
      selectedCategory?.title?.toLowerCase().includes('hush talk') ||
      selectedCategory?.title?.toLowerCase().includes('she read') ||
      selectedCategory?.title?.toLowerCase().includes('she reads'),
    );
    setselectedCategoryId(selectedCategory.id);
  };

  return (
    <div>
      {/* {!editPostDetails && (
        <div className="mb-2">
          <Heading priority="4">Ask a question</Heading>
        </div>
      )} */}
      <div>
        <div className="">
          <Text size="base" color="text-black-900" font="font-light">
            You can only choose one category
          </Text>
        </div>
        <div className="flex flex-wrap gap-2 py-4">
          {categories.map((category: { id: string; title: string }) => {
            return (
              <div
                className="cursor-pointer"
                key={category.id}
                onClick={() => handleCategorySelect(category)}
              >
                <Tag
                  size="sm"
                  type="chips"
                  rounded
                  isActive={selectedCategoryId === category.id}
                >
                  {startCase(category.title)}
                </Tag>
              </div>
            );
          })}
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
      <div className="mt-6">
        <Button
          isLoading={loading}
          block
          isdisabled={!selectedCategoryId || loading}
          onClick={handleSubmit}
        >
          Create
        </Button>
      </div>
    </div>
  );
}

export default Category;
