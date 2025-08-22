// frontend/src/pages/Analyze/components/ActiveTrendChart.tsx

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Filler,
} from 'chart.js';

import analyticsService, { TrendData } from '../../../services/analyticsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ActiveTrendChart: React.FC = () => {
  const [trendData, setTrendData] = useState<ChartData<'line'>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchChartData = async () => {
      setLoading(true);
      const result = await analyticsService.getActiveTrendChartData();

      if (result.success && result.data) {
        const labels = result.data.map(item => item.date);
        const values = result.data.map(item => item.count);

        setTrendData({
          labels: labels,
          datasets: [
            {
              label: 'Active Users',
              data: values,
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: 'rgba(59, 130, 246, 1)',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 3,
            },
          ],
        });
      } else {

        const errorDetail = result.errors?.detail || result.errors?.general || "Could not load chart data.";
        setError(errorDetail);
        console.error("Error fetching active trend data:", result.errors);
      }
      setLoading(false);
    };

    fetchChartData();
  }, []);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, 
      },
      title: {
        display: false, 
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return `Date: ${context[0].label}`;
          },
          label: function(context) {
            return `Active Users: ${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: 'rgba(107, 114, 128, 0.8)',
          font: {
            size: 11,
            weight: 500,
          },
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          display: false, 
          stepSize: 1,
        },
        border: {
          display: false,
        },
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverRadius: 6,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sdg-secondary-red"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-2 h-96 w-full">
      {trendData && <Line options={options} data={trendData} />}
    </div>
  );
};

export default ActiveTrendChart;