"use client";

import useSWR, { type SWRConfiguration } from "swr";
import type { ApiResponse } from "@/types";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return json.data as T;
};

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const paginatedFetcher = async <T>(url: string): Promise<PaginatedResult<T>> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return { data: json.data || [], meta: json.meta || { page: 1, limit: 20, total: 0, totalPages: 0 } };
};

export function useSwrFetch<T>(
  url: string | null,
  config?: SWRConfiguration<T>
) {
  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    ...config,
  });
}

export function useSwrPaginated<T = unknown>(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined>,
  config?: SWRConfiguration<PaginatedResult<T>>
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const url = `${baseUrl}?${searchParams.toString()}`;
  return useSWR<PaginatedResult<T>>(url, paginatedFetcher, {
    revalidateOnFocus: false,
    ...config,
  });
}
