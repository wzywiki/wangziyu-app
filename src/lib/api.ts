// API service for 王梓钰Wiki App
// 对接服务器 API: http://170.106.143.188/api

const BASE_URL = 'http://170.106.143.188/api';

export const API = {
  BASE: BASE_URL,
  // Activity
  activityFilter: (params: Record<string, string | number>) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => p.append(k, String(v)));
    return `${BASE_URL}/activity/filter?${p.toString()}`;
  },
  activityHistory: () => `${BASE_URL}/activity/history`,
  activityFuture: () => `${BASE_URL}/activity/filter?time_type=future&page=1&size=100`,
  activityPast: () => `${BASE_URL}/activity/filter?time_type=past&page=1&size=200`,
  activityDetail: (id: string) => `${BASE_URL}/activity/detail?id=${id}`,

  // Music
  musicLatest: () => `${BASE_URL}/music/latest`,
  musicFilter: (params: Record<string, string | number | string[]>) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(item => p.append(k, item));
      else p.append(k, String(v));
    });
    return `${BASE_URL}/music/filter?${p.toString()}`;
  },
  musicDetail: (id: string) => `${BASE_URL}/music/detail?id=${id}`,
  musicAttr: () => `${BASE_URL}/music/attr`,

  // Video
  videoLatest: () => `${BASE_URL}/video/latest`,
  videoFilter: (params: Record<string, string | number | string[]>) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(item => p.append(k, item));
      else p.append(k, String(v));
    });
    return `${BASE_URL}/video/filter?${p.toString()}`;
  },
  videoDetail: (id: string) => `${BASE_URL}/video/detail?id=${id}`,
  videoAttr: () => `${BASE_URL}/video/attr`,

  // Pic
  picLatest: () => `${BASE_URL}/pic/latest`,
  picFilter: (params: Record<string, string | number | string[]>) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(item => p.append(k, item));
      else p.append(k, String(v));
    });
    return `${BASE_URL}/pic/filter?${p.toString()}`;
  },
  picDetail: (id: string) => `${BASE_URL}/pic/detail?id=${id}`,
  picAttr: () => `${BASE_URL}/pic/attr`,
  picAiSearch: (type: string, q: string, page: number, size: number) => {
    const p = new URLSearchParams({ type, q, page: String(page), size: String(size) });
    return `${BASE_URL}/pic/ai_search?${p.toString()}`;
  },

  // Museum
  museumLatest: () => `${BASE_URL}/museum/latest`,
  museumFilter: (params: Record<string, string | number | string[]>) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(item => p.append(k, item));
      else p.append(k, String(v));
    });
    return `${BASE_URL}/museum/filter?${p.toString()}`;
  },
  museumDetail: (id: string) => `${BASE_URL}/museum/detail?id=${id}`,
  museumAttr: () => `${BASE_URL}/museum/attr`,

  // Lyric
  lyricSearch: (q: string) => `${BASE_URL}/lyric/search?q=${encodeURIComponent(q)}`,
};

// 全局内存缓存
interface CacheEntry { data: unknown; expireAt: number; }
const _cache = new Map<string, CacheEntry>();

function getCacheTTL(url: string): number {
  if (url.includes('id=')) return 5 * 60 * 1000;
  return 10 * 60 * 1000;
}

export async function apiFetch<T>(url: string): Promise<T> {
  const now = Date.now();
  const cached = _cache.get(url);
  if (cached && cached.expireAt > now) return cached.data as T;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (data.status !== 0) throw new Error(data.msg || 'API error');
  _cache.set(url, { data: data.data, expireAt: now + getCacheTTL(url) });
  return data.data as T;
}

// Types
export interface Activity {
  id: string;
  name: string;
  note: string;
  time: string;
  pics: string[];
  url: string[];
  link: string[];
  music: string[];
}

export interface Music {
  id: string;
  name: string;
  music_type: string;
  language: string;
  solo: string;
  publish_time: string;
  album: string;
  pv_mv: string | null;
  platform: {
    netease: string | null;
    qq_music: string | null;
    bilibili: string | null;
    sing: string | null;
  };
  staff: Array<{ type: string; name: string }>;
  note: string;
  cover_url?: string;
  play_url?: string;
  lyric?: string;
}

export interface Video {
  id: string;
  name: string;
  publish_time: string;
  type: string;
  duration: number;
  cover: string;
  cover_url: string;
  sources: Array<{
    platform: string;
    aid?: string;
    bvid?: string;
    mid?: string;
  }>;
}

export interface PicSet {
  id: string;
  name: string;
  date: string;
  type: string;
  pics: string[];
  author?: string;
  tag?: string[];
  note?: string;
  cover_url?: string;
  pics_url?: string[];
}

export interface MuseumItem {
  id: string;
  name: string;
  note: string;
  publish_date: string;
  year: string;
  type: string;
  publish_method: string;
  cover: string;
  cover_url: string;
  item_count: number;
  item_types: string[];
  dimension?: { w: number; d: number; h: number };
  items?: Array<{
    id: string;
    type: string;
    image_url: string;
    filename: string;
  }>;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getBilibiliUrl(bvid: string): string {
  return `https://www.bilibili.com/video/${bvid}`;
}

export function getActivityPicUrl(path: string): string {
  return `https://rwikipic.21hz.top/pic_service/pic?path=${encodeURIComponent(path)}&thumbnail=1`;
}
