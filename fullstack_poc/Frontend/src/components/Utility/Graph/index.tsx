import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import NotFoundComponent from '@/components/Utility/NotFoundComponent';

interface ChartItem {
  start_date: string;
  count: number;
  trafficCount?: number;
  uniqueUsers?: number;
  newUsers?: number;
  leftusers?: number;
}

interface GraphData {
  fetchCampfireTrafficGraph?: {
    data: { Count: ChartItem[] };
  };
  fetch_campfire_unique_users_graph?: ChartItem[];
  fetch_campfire_new_users_graph?: ChartItem[];
  fetch_campfire_left_users_graph?: ChartItem[];
}

interface ChartDataPoint {
  x: string;
  y: number;
}

interface IGraph {
  data: GraphData;
  activeTab: string;
  selectedDuration: number;
  loading: boolean;
  error?: Error | null;
}

const Graph = ({
  data,
  activeTab,
  selectedDuration,
  loading,
  error,
}: IGraph) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const extractChartData = (chartData: GraphData): ChartDataPoint[] => {
    if (!chartData) return [];

    switch (activeTab) {
      case 'traffic':
        return (
          chartData?.fetchCampfireTrafficGraph?.data.Count.map((item) => ({
            x: formatDate(item.start_date),
            y: selectedDuration === 7 ? item.count : item.trafficCount || 0,
          })) || []
        );
      case 'uniqueUsers':
        return (
          chartData?.fetch_campfire_unique_users_graph?.map((item) => ({
            x: formatDate(item.start_date),
            y: item.count ?? 0,
          })) || []
        );
      case 'newMembers':
        return (
          chartData?.fetch_campfire_new_users_graph?.map((item) => ({
            x: formatDate(item.start_date),
            y: item.count ?? 0,
          })) || []
        );
      case 'leftMembers':
        return (
          chartData?.fetch_campfire_left_users_graph?.map((item) => ({
            x: formatDate(item.start_date),
            y: item.count ?? 0,
          })) || []
        );
      default:
        return [];
    }
  };

  const chartData = extractChartData(data);
  const allValuesAreZero = chartData?.every(
    (item: ChartDataPoint) => item.y === 0,
  );

  return (
    <div>
      {loading ? (
        <div
          className="m-5 flex items-center justify-center"
          style={{ minHeight: 250 }}
        >
          <TabletLoader style={{ marginTop: 40, height: 200 }} />
        </div>
      ) : allValuesAreZero || error ? (
        <div className="mt-4">
          <NotFoundComponent errorMessage="Oops! No data to show" />
        </div>
      ) : (
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ left: -20 }}>
              <XAxis
                tickLine={false}
                dataKey="x"
                type="category"
                padding={{ left: 10 }}
                tick={{
                  fontSize: '10px',
                  fill: '#828282',
                }}
                tickMargin={10}
                interval={selectedDuration === 7 ? 0 : 'preserveStartEnd'}
              />
              <YAxis
                tickLine={false}
                tickFormatter={(tick) => (tick === 0 ? '' : `${tick}`)}
                tick={{
                  fontSize: '10px',
                  fill: '#828282',
                }}
                tickMargin={10}
                padding={{ top: 40 }}
              />
              <Bar dataKey="y" fill="#7BE9E2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Graph;
