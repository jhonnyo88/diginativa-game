// STORY-PROGRESS-001.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

// Types and Interfaces
interface ProgressSummary {
  total_completed: number;
  total_in_progress: number;
  completion_rate: number;
  last_activity: string;
}

interface ProgressDetail {
  category: string;
  completed: number;
  total: number;
  progress_percentage: number;
}

interface ProgressDetailsResponse {
  items: ProgressDetail[];
}

interface ProgressDashboardProps {
  timePeriod?: string;
  category?: string;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  timePeriod = 'all',
  category = 'all',
}) => {
  // State management
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [details, setDetails] = useState<ProgressDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch summary data
        const summaryResponse = await axios.get<ProgressSummary>(
          '/api/v1/dashboard/progress'
        );

        // Fetch details data
        const detailsResponse = await axios.get<ProgressDetailsResponse>(
          '/api/v1/dashboard/progress/details',
          {
            params: {
              time_period: timePeriod,
              category: category,
            },
          }
        );

        setSummary(summaryResponse.data);
        setDetails(detailsResponse.data.items);
      } catch (err) {
        setError(
          'Det gick inte att hämta framstegsdata. Försök igen senare.'
        );
        console.error('Error fetching progress data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timePeriod, category]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" role="status">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="sr-only">Laddar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="bg-red-50 border-l-4 border-red-500 p-4 my-4"
      >
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Din framstegsdashboard
      </h1>

      {/* Summary Section */}
      {summary && (
        <section
          aria-label="Översikt"
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h2 className="text-sm text-gray-500">Genomförda</h2>
              <p className="text-2xl font-bold text-blue-600">
                {summary.total_completed}
              </p>
            </div>
            <div>
              <h2 className="text-sm text-gray-500">Pågående</h2>
              <p className="text-2xl font-bold text-orange-500">
                {summary.total_in_progress}
              </p>
            </div>
            <div>
              <h2 className="text-sm text-gray-500">Genomförandegrad</h2>
              <p className="text-2xl font-bold text-green-600">
                {(summary.completion_rate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Senaste aktivitet:{' '}
            {format(new Date(summary.last_activity), 'PPP', { locale: sv })}
          </p>
        </section>
      )}

      {/* Details Section */}
      <section
        aria-label="Detaljerad framstegsöversikt"
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Detaljerad översikt
        </h2>
        <div className="space-y-4">
          {details.map((detail, index) => (
            <div
              key={index}
              className="border-b border-gray-200 pb-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">{detail.category}</span>
                <span className="text-sm text-gray-500">
                  {detail.completed} av {detail.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${detail.progress_percentage}%` }}
                  role="progressbar"
                  aria-valuenow={detail.progress_percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProgressDashboard;
