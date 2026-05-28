import { useMutation } from '@apollo/client/react';
import React, { useEffect, useRef, useState } from 'react';

import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import GDPGlobe from '@/components/Utility/Map/GDPGlobe';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { GET_CAMPFIRE_MAP_DATA } from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';

interface CountryData {
  country: string;
  traffic: number;
}

interface MapResponse {
  mapData: {
    success: boolean;
    data: CountryData[];
  };
}

interface IMapProps {
  campfireId: string;
}

const Map = ({ campfireId }: IMapProps) => {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [globeLoaded, setGlobeLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countriesData, setCountriesData] = useState<CountryData[]>([]);
  const token = useAppSelector(selectGetToken);
  const [getMapData, { loading }] = useMutation<MapResponse>(
    GET_CAMPFIRE_MAP_DATA,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: (response) => {
        if (response.mapData.success) {
          const sortedData = response.mapData.data.sort(
            (a, b) => b.traffic - a.traffic,
          );
          setCountriesData(sortedData);
        } else {
          emitErrorNotification('Failed to fetch map data');
        }
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (campfireId) {
      getMapData({ variables: { campfireId } });
    }
  }, [campfireId, getMapData]);

  if (!isClient) {
    return (
      <div className="mt-20">
        <TabletLoader />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center min-h-[600px]">
      {loading ? (
        <div className="mt-20">
          <TabletLoader />
        </div>
      ) : (
        <>
          <div className="w-full flex justify-center">
            <GDPGlobe />
          </div>
        </>
      )}
    </div>
  );
};

export default Map;
