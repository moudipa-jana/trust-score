{
  /**
   * PreviousSearches displays a list of past search terms with options to reselect,
   * delete individual entries, or clear all, styled for both mobile and desktop views.
   */
}
import React from 'react';

import DeleteIcon from '/public/images/delete.svg';
import RecentlyViewed from '/public/images/recentlyViewed.svg';
import null_point from '/public/images/null_point.svg';
import CustomImage from '@/components/Utility/CustomImage';
import { searchHistoryItem } from '@/components/Utility/CustomSearchList';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { transformText } from '@/lib/helpers';

interface PreviousSearchesProps {
  onPreviousSearchClick: (searchText: string) => void;
  onDeleteSearch: (searchText: string) => void;
  onClearAll: () => void;
  previousSearches: searchHistoryItem[];
}

const PreviousSearches: React.FC<PreviousSearchesProps> = ({
  onPreviousSearchClick,
  onDeleteSearch,
  onClearAll,
  previousSearches,
}) => {
  const isMobile = useIsMobile();

  return (
    <>
      {previousSearches.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            marginRight: '25px',
            marginTop: '15px',
          }}
        >
          <button onClick={onClearAll} className="text-md text-skyBlue-200">
            Clear all
          </button>
        </div>
      )}

      <ul className="previous-searches px-6 pb-2 pt-13">
        {previousSearches.length > 0 ? (
          previousSearches
            .slice(0, 4)
            .map(({ text: searchText }: searchHistoryItem) => (
              <div
                className="previous-search-item"
                key={`search-${searchText}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    marginRight: 'auto',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => onPreviousSearchClick(searchText)}
                  >
                    <CustomImage src={RecentlyViewed}></CustomImage>
                  </div>
                  <div
                    onClick={() => onPreviousSearchClick(searchText)}
                    className="cursor-pointer text-md text-gray-850"
                  >
                    {(transformText(searchText) as string)?.length > 30
                      ? transformText(searchText)?.slice(
                          0,
                          isMobile ? 22 : 60,
                        ) + '...'
                      : transformText(searchText)}
                  </div>
                </div>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => onDeleteSearch(searchText)}
                >
                  <CustomImage src={DeleteIcon}></CustomImage>
                </div>
              </div>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <div className="h-40 w-40">
              <CustomImage src={null_point} fill />
            </div>

            <Text color="text-gray-500" size="sm" font="font-bold">
              No previous search words
            </Text>
          </div>
        )}
      </ul>
    </>
  );
};

export default PreviousSearches;
