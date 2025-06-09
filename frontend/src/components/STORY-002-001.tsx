// STORY-002-001.tsx

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';

// Interfaces
interface Feature {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at?: string;
}

interface FeatureListResponse {
  features: Feature[];
  total_count: number;
  page: number;
  page_size: number;
}

interface CreateFeaturePayload {
  name: string;
  description: string;
  status: string;
}

// API functions
const fetchFeatures = async (page: number = 1): Promise<FeatureListResponse> => {
  const response = await axios.get(`/api/v1/features?page=${page}`);
  return response.data;
};

const createFeature = async (payload: CreateFeaturePayload): Promise<Feature> => {
  const response = await axios.post('/api/v1/features', payload);
  return response.data;
};

const FeatureManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [newFeature, setNewFeature] = useState<CreateFeaturePayload>({
    name: '',
    description: '',
    status: 'pending',
  });

  // Fetch features
  const {
    data,
    isLoading,
    error,
    isError,
  } = useQuery<FeatureListResponse, AxiosError>(
    ['features', page],
    () => fetchFeatures(page),
    {
      keepPreviousData: true,
    }
  );

  // Create feature mutation
  const createFeatureMutation = useMutation(createFeature, {
    onSuccess: () => {
      queryClient.invalidateQueries('features');
      setNewFeature({ name: '', description: '', status: 'pending' });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createFeatureMutation.mutate(newFeature);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen" role="status">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="sr-only">Laddar...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      >
        <strong className="font-bold">Ett fel uppstod! </strong>
        <span className="block sm:inline">{error?.message}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Funktionshantering</h1>

      {/* Create Feature Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8"
      >
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Namn
          </label>
          <input
            id="name"
            type="text"
            value={newFeature.name}
            onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Beskrivning
          </label>
          <textarea
            id="description"
            value={newFeature.description}
            onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={3}
            required
          />
        </div>

        <button
          type="submit"
          disabled={createFeatureMutation.isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {createFeatureMutation.isLoading ? 'Sparar...' : 'Skapa funktion'}
        </button>
      </form>

      {/* Features List */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-xl font-semibold mb-4">Befintliga funktioner</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Namn</th>
                <th className="px-4 py-2 text-left">Beskrivning</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Skapad</th>
              </tr>
            </thead>
            <tbody>
              {data?.features.map((feature) => (
                <tr key={feature.id} className="border-b">
                  <td className="px-4 py-2">{feature.name}</td>
                  <td className="px-4 py-2">{feature.description}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      feature.status === 'active' ? 'bg-green-100 text-green-800' :
                      feature.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {feature.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(feature.created_at).toLocaleDateString('sv-SE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Föregående
          </button>
          <span>Sida {page} av {Math.ceil((data?.total_count || 0) / (data?.page_size || 10))}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!data?.features.length || data.features.length < data.page_size}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Nästa
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureManagement;
