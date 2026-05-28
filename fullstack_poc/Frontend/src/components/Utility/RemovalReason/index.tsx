import { useLazyQuery } from '@apollo/client/react';
import { capitalize } from 'lodash';
import React, { MouseEvent, useEffect, useState } from 'react';

import Button from '@/components/Utility/Button';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { GET_REMOVAL_REASONS } from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';

interface ReasonProps {
  handleSumbit: () => void;
  campfireId?: string;
  selectedReasonId?: string;
  setSelectedReasonId: (text: string) => void;
}

const HeadingComponent: React.FC = () => {
  return (
    <div>
      <Heading priority={4}>Why are you deleting this post?</Heading>
    </div>
  );
};

const RemovalReason: React.FC<ReasonProps> = ({
  handleSumbit,
  campfireId,
  selectedReasonId,
  setSelectedReasonId,
}: ReasonProps) => {
  const [reportTypesData, setReportTypesData] = useState([]);
  const [disabledButton, setDisabledButton] = useState(true);
  const token = useAppSelector(selectGetToken);
  const deviceWidth = window.innerWidth;

  const [fetchRemovalReasons, { loading, error, data: reasonsData }] =
    useLazyQuery(GET_REMOVAL_REASONS, {
      fetchPolicy: 'no-cache',
    });

  useEffect(() => {
    fetchRemovalReasons({
      variables: { campfireId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }, [fetchRemovalReasons, campfireId, token]);

  // Handle removal reasons response
  useEffect(() => {
    if (reasonsData) {
      setReportTypesData((reasonsData as any)?.campfire_reasons_to_remove);
      if ((reasonsData as any)?.campfire_reasons_to_remove?.length === 0) {
        handleSumbit();
      }
    }
  }, [reasonsData]);

  // Handle removal reasons error
  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  function onChangeValue(reportReasonObj: { id: string; title: string }) {
    setSelectedReasonId(reportReasonObj.id);
    setDisabledButton(false);
  }

  if (error)
    return (
      <>
        <HeadingComponent />
        <div className="mt-12 mb-12 py-4">
          <p className="text-center text-red-700">
            Oops! something went wrong!
          </p>
        </div>
      </>
    );
  return (
    <div>
      <div className=" ">
        <HeadingComponent />
        {loading ? (
          <div className="mt-12 mb-12 py-4">
            <TabletLoader style={{ height: 100 }} />
          </div>
        ) : (
          <div className="py-4 ">
            <ul
              style={{ scrollbarWidth: deviceWidth <= 820 ? 'auto' : 'none' }}
              className="scrollbar mb-10 max-h-[430px] overflow-y-scroll"
            >
              {reportTypesData.map(
                (reportData: {
                  id: string;
                  index: number;
                  title: string;
                  reason: string;
                  description: string;
                }) => {
                  return (
                    <li
                      className="cursor-pointer py-2"
                      onClick={(e: MouseEvent<HTMLElement>) => {
                        e.stopPropagation();
                        onChangeValue(reportData);
                      }}
                      key={reportData.id}
                    >
                      <div className=" flex items-center justify-start gap-3">
                        <input
                          type="radio"
                          value={reportData.id}
                          checked={selectedReasonId === reportData.id}
                          name="option"
                          className="radioButton h-5 w-5 cursor-pointer "
                        />
                        <Text size="base" font="font-semibold">
                          {capitalize(reportData.reason)}
                        </Text>
                      </div>
                      <div className="pl-8">
                        <Text
                          size="sm"
                          color="text-black-900"
                          font="font-light"
                        >
                          {reportData.description}
                        </Text>
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
            <div className=" flex items-center justify-center px-14 lg:px-40">
              <Button
                size="lg"
                block
                isdisabled={disabledButton}
                onClick={(e: MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  handleSumbit();
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemovalReason;
