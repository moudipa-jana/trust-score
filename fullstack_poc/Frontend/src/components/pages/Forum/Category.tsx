import { capitalize } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { suggestCategory } from '@/actions/category';
import fetchCategories from '@/actions/forum';
import Dropdown, { DropdownOptionType } from '@/components/Utility/Dropdown';
import Loader from '@/components/Utility/Loader';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { Categories } from '@/types/category';

interface CategoryProps {
  block?: boolean;
}

function Category({ block }: CategoryProps) {
  const router = useRouter();

  const token = useAppSelector((state) => state.auth.token);
  const categories = useAppSelector((state) => state.necessary.categories);
  const loading = useAppSelector((state) => state.necessary.loading);
  const profile = useAppSelector((state) => state.auth.profile);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategorySelect = (option: DropdownOptionType) => {
    router.push(encodeURI(`/category/${option.label}`));
  };

  const onSearchSuggest = (value: string) => {
    if (!token || !profile) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    suggestCategory(value, profile.id, token);
  };

  return (
    <div className={` ${block ? '' : 'sm-container relative z-110 mb-8'}`}>
      <div
        className={` ${block ? 'w-full' : 'm-auto mt-6 lg:w-1/2 xl:w-2/6'} `}
      >
        {loading ? (
          <div className="m-3 flex justify-center">
            <Loader variant="circle" />
          </div>
        ) : (
          <Dropdown
            textCenter
            isSearchable
            options={categories.map((ctg: Categories) => ({
              value: ctg.id,
              label: capitalize(ctg.title),
            }))}
            placeHolder="Category Dropdown"
            onChange={
              handleCategorySelect as (
                value: DropdownOptionType | DropdownOptionType[],
              ) => void
            }
            handleCategorySuggestion={onSearchSuggest}
          />
        )}
      </div>
    </div>
  );
}

export default Category;
