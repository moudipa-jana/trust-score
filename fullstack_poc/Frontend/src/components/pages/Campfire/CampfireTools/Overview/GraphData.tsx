import { DocumentNode } from '@apollo/client';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import React, { useEffect, useRef, useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import Graph from '@/components/Utility/Graph';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import {
  FETCH_CAMPFIRE_LEFT_USERS_GRAPH,
  FETCH_CAMPFIRE_NEW_USERS_GRAPH,
  FETCH_CAMPFIRE_TRAFFIC_GRAPH,
  FETCH_CAMPFIRE_UNIQUE_USER_GRAPH,
} from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';

const TABS: {
  name: string;
  key: string;
  type: 'mutation' | 'query';
  operation: DocumentNode;
}[] = [
  {
    name: 'Traffic',
    key: 'traffic',
    type: 'mutation',
    operation: FETCH_CAMPFIRE_TRAFFIC_GRAPH,
  },
  {
    name: 'Unique users',
    key: 'uniqueUsers',
    type: 'query',
    operation: FETCH_CAMPFIRE_UNIQUE_USER_GRAPH,
  },
  {
    name: 'New members',
    key: 'newMembers',
    type: 'query',
    operation: FETCH_CAMPFIRE_NEW_USERS_GRAPH,
  },
  {
    name: 'Left members',
    key: 'leftMembers',
    type: 'query',
    operation: FETCH_CAMPFIRE_LEFT_USERS_GRAPH,
  },
];

interface IGraphData {
  campfireId: string;
}

const GraphData = ({ campfireId }: IGraphData) => {
  const [isDurationDropdown, setIsDurationDropdown] = useState<boolean>(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const [activeTab, setActiveTab] = useState<string>('traffic');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = useAppSelector(selectGetToken);

  const activeTabConfig = TABS.find((tab) => tab.key === activeTab);

  const [
    fetchMutationData,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(
    activeTabConfig?.type === 'mutation'
      ? activeTabConfig.operation
      : FETCH_CAMPFIRE_TRAFFIC_GRAPH,
    {
      context: { headers: { Authorization: `Bearer ${token}` } },
      onError: (err) => emitErrorNotification(formatGraphqlError(err)),
    },
  );

  const [
    fetchQueryData,
    { data: queryData, loading: queryLoading, error: queryError },
  ] = useLazyQuery(
    activeTabConfig?.type === 'query'
      ? activeTabConfig.operation
      : FETCH_CAMPFIRE_NEW_USERS_GRAPH,
  );

  useEffect(() => {
    if (queryError) {
      emitErrorNotification(formatGraphqlError(queryError));
    }
  }, [queryError]);

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    setIsDurationDropdown(false);
  };

  const formatDurationText = (duration: number) => {
    return duration === 365 ? 'Last 1 year' : `Last ${duration} days`;
  };

  useEffect(() => {
    if (!activeTabConfig || !selectedDuration) return;

    const variables = {
      campfireId,
      duration: selectedDuration,
    };

    if (activeTabConfig.type === 'mutation') {
      fetchMutationData({ variables });
    } else {
      fetchQueryData({
        variables,
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabConfig, selectedDuration, campfireId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDurationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const graphData =
    activeTabConfig?.type === 'query' ? queryData : mutationData;
  const loading =
    activeTabConfig?.type === 'query' ? queryLoading : mutationLoading;
  const error = activeTabConfig?.type === 'query' ? queryError : mutationError;

  return (
    <>
      <div className="mt-16 ml-4 flex items-center justify-between xl:mx-4">
        <div className="flex space-x-3 xl:space-x-10">
          {TABS.map(
            (tab: {
              name: string;
              key: string;
              operation: DocumentNode;
              type: 'mutation' | 'query';
            }) => (
              <div
                key={tab.key}
                className={`cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-black'
                } `}
                onClick={() => setActiveTab(tab.key)}
              >
                <Text
                  size="xsm"
                  color={activeTab === tab.key ? 'text-primary' : 'text-black'}
                >
                  {tab.name}
                </Text>
              </div>
            ),
          )}
        </div>
        <div ref={dropdownRef}>
          <div
            className="flex cursor-pointer items-center space-x-1 rounded-full border border-primary py-0.5 px-2 text-primary xl:space-x-2 xl:py-1 xl:px-4"
            onClick={() => setIsDurationDropdown(!isDurationDropdown)}
          >
            <Text size="base" color="text-primary">
              {formatDurationText(selectedDuration)}
            </Text>
            {isDurationDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>
          {isDurationDropdown && (
            <div className="absolute z-10 mt-3 space-y-3 rounded-lg border border-primary bg-white py-2 pl-5 pr-2 text-right xl:pr-2 xl:pl-8">
              <div onClick={() => handleDurationChange(7)}>
                <Text size="base">Last 7 days</Text>
              </div>
              <div onClick={() => handleDurationChange(30)}>
                <Text size="base">Last 30 days</Text>
              </div>
              <div onClick={() => handleDurationChange(365)}>
                <Text size="base">Last year</Text>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-10">
        <Graph
          data={graphData as any}
          activeTab={activeTab}
          selectedDuration={selectedDuration}
          loading={loading}
          error={error}
        />
      </div>
    </>
  );
};

export default GraphData;
