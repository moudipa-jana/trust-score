import { useQuery } from '@apollo/client/react';
import { capitalize } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Button from '@/components/Utility/Button';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { QUERY_GET_REPORT_TYPES } from '@/service/graphql/Flag';
import { selectGetToken } from '@/state/Slices/auth';

interface FlagProps {
  reportId: string;
  handleSumbit: () => void;
  setReportId: (reportId: string) => void;
  setFlagSteps: (step: number) => void;
}

const HeadingComponent: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <div>
        {router.pathname.includes('/user/') ? (
          <Heading priority={4}>Why are you flagging this user?</Heading>
        ) : (
          <Heading priority={4}>Why are you reporting this post?</Heading>
        )}
      </div>
      <Text size="base">
        Your report is anonymous. If someone is in immediate danger, inform the
        authorities, don&apos;t linger.{' '}
      </Text>
    </>
  );
};

const Flag: React.FC<FlagProps> = ({
  reportId,
  handleSumbit,
  setReportId,
  setFlagSteps,
}: FlagProps) => {
  const [reportTypesData, setReportTypesData] = useState([]);
  const [disabledButton, setDisabledButton] = useState(true);
  const token = useAppSelector(selectGetToken);
  const deviceWidth = window.innerWidth;

  const {
    loading,
    error,
    data: reportTypesResponse,
  } = useQuery(QUERY_GET_REPORT_TYPES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Handle report types response
  useEffect(() => {
    if (reportTypesResponse) {
      setReportTypesData((reportTypesResponse as any).report_types);
    }
  }, [reportTypesResponse]);

  function onChangeValue(reportReasonObj: { id: string; title: string }) {
    setReportId(reportReasonObj.id);
    setDisabledButton(false);
    if (reportReasonObj.title.toLowerCase() === 'something else') {
      setFlagSteps(1);
    }
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
                  title: string;
                  description: string;
                }) => {
                  return (
                    <li
                      className="cursor-pointer py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeValue(reportData);
                      }}
                      key={reportData.id}
                    >
                      <div className=" flex items-center justify-start gap-3">
                        <input
                          type="radio"
                          value={reportData.id}
                          checked={reportId === reportData.id}
                          name="option"
                          className="radioButton h-5 w-5 cursor-pointer "
                        />
                        <Text size="base" font="font-semibold">
                          {capitalize(reportData.title)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleSumbit();
                }}
              >
                Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flag;
