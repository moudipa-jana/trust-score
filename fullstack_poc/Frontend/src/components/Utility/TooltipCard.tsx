{
  /**
   * TooltipCard displays a list of edited data with a loading state.
   * Shows a loader when data is loading, and a message if no history is found.
   * Each text item is rendered with links using LinkifyText.
   *
   * */
}

import { isEmpty } from 'lodash';
import React, { MutableRefObject } from 'react';

import LinkifyText from '@/components/Utility/LinkifyText';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Text from '@/elements/Text';

interface TooltipCardProps {
  editedData: string[];
  dataLoading: boolean;
  tooltipRef: MutableRefObject<HTMLDivElement | null>;
}

const TooltipCard = ({
  editedData,
  dataLoading,
  tooltipRef,
}: TooltipCardProps) => {
  return (
    <div
      ref={tooltipRef}
      className="absolute -top-36 -left-40 z-20 w-[322px] rounded-lg bg-white  shadow-md lg:top-5 lg:left-2 lg:w-[385px] xl:top-1 xl:left-16 xl:w-[570px] "
    >
      <div className="custom-scrollbar my-1 mx-2.5 max-h-[196px] overflow-auto px-4 py-3 xl:px-6 xl:py-3.5">
        {dataLoading ? (
          <div className="mx-auto">
            <TabletLoader style={{ height: 50 }} />
          </div>
        ) : (
          <div className="space-y-3">
            {isEmpty(editedData) ? (
              <Text size="base" color="text-gray-1000">
                Oops! No history found.
              </Text>
            ) : (
              editedData.map((text: string, index: number) => (
                <Text
                  key={`${text + index}`}
                  size="base"
                  color="text-gray-1000"
                >
                  <LinkifyText text={text} />
                </Text>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TooltipCard;
