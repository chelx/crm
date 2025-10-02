import { DataProvider } from '@refinedev/core';
import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(error.config);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters }) => {
    const url = `/${resource}`;
    const { current = 1, pageSize = 10 } = pagination ?? {};

    const queryParams = new URLSearchParams();
    queryParams.append('page', current.toString());
    queryParams.append('limit', pageSize.toString());

    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      queryParams.append('sortBy', sorter.field);
      queryParams.append('sortOrder', sorter.order);
    }

    if (filters) {
      filters.forEach((filter) => {
        if ('field' in filter && filter.field && 'value' in filter && filter.value) {
          queryParams.append(filter.field, filter.value);
        }
      });
    }

    const { data } = await axiosInstance.get(`${url}?${queryParams}`);

    return {
      data: data.data || data,
      total: data.total || (Array.isArray(data.data) ? data.data.length : 0),
    };
  },

  getOne: async ({ resource, id }) => {
    const url = `/${resource}/${id}`;
    const { data } = await axiosInstance.get(url);

    return {
      data: data.data || data,
    };
  },

  create: async ({ resource, variables }) => {
    const url = `/${resource}`;
    const { data } = await axiosInstance.post(url, variables);

    return {
      data: data.data || data,
    };
  },

  update: async ({ resource, id, variables }) => {
    const url = `/${resource}/${id}`;
    const { data } = await axiosInstance.put(url, variables);

    return {
      data: data.data || data,
    };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `/${resource}/${id}`;
    await axiosInstance.delete(url);

    return {
      data: { id } as any,
    };
  },

  getApiUrl: () => {
    return API_URL;
  },

  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    let requestUrl = `${url}?`;

    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      requestUrl += `_sort=${sorter.field}:${sorter.order}`;
    }

    if (filters) {
      filters.forEach((filter) => {
        if ('field' in filter && filter.field && 'value' in filter && filter.value) {
          requestUrl += `&${filter.field}=${filter.value}`;
        }
      });
    }

    if (query) {
      requestUrl += `&${query}`;
    }

    const { data } = await axiosInstance({
      url: requestUrl,
      method,
      data: payload,
      headers: headers,
    });

    return Promise.resolve({ data });
  },
};
