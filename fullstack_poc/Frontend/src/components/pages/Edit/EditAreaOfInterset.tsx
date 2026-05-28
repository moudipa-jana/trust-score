import { useLazyQuery } from '@apollo/client/react';
import { get, startCase } from 'lodash';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';
import SearchComponent from '@/components/Utility/SearchComponent';
import Tag from '@/components/Utility/Tag';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { QUERY_GET_CATEGORIES } from '@/service/graphql/Category';
import { CategoryId } from '@/types/category';
import { editProfileDetailsType } from '@/types/profile';
import SwitchButton from '@/components/Utility/SwitchButton';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';

const hushTalkId = '2d624335-c513-4cbd-a482-48ab4be44467';
const sheReadsIds = [
  '55a8f4c1-6962-4f18-a621-c24c0d123456', // Placeholder, using title-based check primarily
  // Add common IDs if known, but title-based is safer for dynamic lists
];

interface Category {
  id: string;
  title: string;
}

interface IEditAreaOfInterset {
  setEditProfileDetails: Dispatch<SetStateAction<editProfileDetailsType>>;
  isCampfireVisibility: boolean;
  areaOfInterests: CategoryId[];
}

function EditAreaOfInterset({
  isCampfireVisibility,
  areaOfInterests,
  setEditProfileDetails,
}: IEditAreaOfInterset) {
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [fetchCategories, { data: categoryData, error: categoryError }] =
    useLazyQuery(QUERY_GET_CATEGORIES);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategorySelect = (category: Category) => {
    const isRestricted =
      category.title.toLowerCase().includes('hush talks') ||
      category.title.toLowerCase().includes('she reads') ||
      category.title.toLowerCase().includes('she read');

    const isAlreadySelected = areaOfInterests.some(
      (obj) => obj['categoryId'] === category.id,
    );

    // Only show modal when selecting (not deselecting) a restricted category
    if (isRestricted && !isAlreadySelected) {
      setPendingCategory(category);
      setShowSensitiveModal(true);
      return;
    }

    toggleCategory(category.id);
  };

  const toggleCategory = (categoryId: string) => {
    const updatedAreaOfInterests = [...areaOfInterests];
    const index = updatedAreaOfInterests.findIndex(
      (obj) => obj['categoryId'] === categoryId,
    );
    if (index === -1) {
      updatedAreaOfInterests.push({ categoryId: categoryId });
    } else {
      updatedAreaOfInterests.splice(index, 1);
    }

    setEditProfileDetails((prevState) => {
      return {
        ...prevState,
        areaOfInterests: updatedAreaOfInterests,
      };
    });
  };

  const handleConfirmAge = () => {
    if (pendingCategory) {
      toggleCategory(pendingCategory.id);
    }
    setShowSensitiveModal(false);
    setPendingCategory(null);
  };
  return (
    <div>
      <Heading priority={2} variant>
        Areas of interest
      </Heading>
      <div className="py-2">
        <Text size="sm" color="text-black-200">
          You can choose your interests from here
        </Text>
        <SearchComponent
          type="transparent"
          suggest={false}
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />
        <div className="mr-1 flex h-36 flex-wrap gap-4 overflow-y-auto py-8">
          {!categoryError ? (
            get(categoryData, 'categories', [])
              .filter((ctg: Category) => ctg.title.includes(startCase(search)))
              .map((ele: Category) => {
                const isActive = areaOfInterests.some(
                  (obj: CategoryId) => obj.categoryId === ele.id,
                );
                return (
                  <div
                    className="cursor-pointer"
                    key={ele.id}
                    onClick={() => handleCategorySelect(ele)}
                  >
                    <Tag type="chips" size="sm" rounded isActive={isActive}>
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
        <SensitiveContentModal
          open={showSensitiveModal}
          onClose={() => setShowSensitiveModal(false)}
          onDeny={() => {
            setShowSensitiveModal(false);
            setPendingCategory(null);
          }}
          onConfirm={handleConfirmAge}
        />
        <div className="pt-4">
          <div className=" flex items-center justify-between py-2">
            <div>
              <Text size="md" color="text-black-900">
                Active in campfire visibility
              </Text>
              <Text size="sm" color="text-black-900">
                Show which campfire I am active in on my profile
              </Text>
            </div>
            <div
              className=""
              onClick={() =>
                setEditProfileDetails((prevState) => {
                  return {
                    ...prevState,
                    isCampfireVisibility: !isCampfireVisibility,
                  };
                })
              }
            >
              <SwitchButton checked={isCampfireVisibility} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditAreaOfInterset;
