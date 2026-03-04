import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API, apiFetch, Music, Video, PicSet, formatDate, formatDuration } from '@/lib/api';
import { Colors, Spacing, FontSize, BorderRadius } from '@/lib/theme';

const { width: SCREEN_W } = Dimensions.get('window');
type Tab = 'pic' | 'music' | 'video';

export default function ResourceScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('pic');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 顶部 Tab 切换 */}
      <View style={styles.tabBar}>
        {(['pic', 'music', 'video'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'pic' ? '图库' : tab === 'music' ? '音乐' : '视频'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'pic' && <PicList />}
      {activeTab === 'music' && <MusicList />}
      {activeTab === 'video' && <VideoList />}
    </SafeAreaView>
  );
}

// ─── 图库列表 ───────────────────────────────────────────────────────────────
function PicList() {
  const router = useRouter();
  const [items, setItems] = useState<PicSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    apiFetch<{ types: string[] }>(API.picAttr()).catch(() => ({ types: [] })).then(attr => {
      setTypes(attr.types || []);
    });
    loadPage(1, '', '');
  }, []);

  const loadPage = async (p: number, q: string, type: string) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    const params: Record<string, string | number> = { page: p, size: 20 };
    if (q) params.q = q;
    if (type) params.type = type;
    try {
      const data = await apiFetch<{ items: PicSet[]; total: number }>(API.picFilter(params));
      const newItems = data.items || [];
      setItems(prev => p === 1 ? newItems : [...prev, ...newItems]);
      setHasMore(newItems.length === 20);
      setPage(p);
    } catch { }
    setLoading(false);
    setLoadingMore(false);
  };

  const handleSearch = () => loadPage(1, search, selectedType);
  const handleType = (t: string) => {
    const next = selectedType === t ? '' : t;
    setSelectedType(next);
    loadPage(1, search, next);
  };
  const loadMore = () => {
    if (!loadingMore && hasMore) loadPage(page + 1, search, selectedType);
  };

  const colW = (SCREEN_W - Spacing.md * 2 - 8) / 3;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索图库..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      <View style={styles.typeRow}>
        {types.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, selectedType === t && styles.typeChipActive]}
            onPress={() => handleType(t)}
          >
            <Text style={[styles.typeChipText, selectedType === t && styles.typeChipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={items}
          numColumns={3}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: Spacing.md, gap: 6 }}
          columnWrapperStyle={{ gap: 6 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} /> : null}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: colW, borderRadius: BorderRadius.sm, overflow: 'hidden', backgroundColor: Colors.bgCard }}
              onPress={() => router.push(`/picDetail?id=${item.id}`)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.cover_url }} style={{ width: colW, aspectRatio: 3 / 4, resizeMode: 'cover' }} />
              <View style={{ padding: 5 }}>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '600', color: Colors.text }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ fontSize: 10, color: Colors.textMuted }}>{formatDate(item.date)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

// ─── 音乐列表 ───────────────────────────────────────────────────────────────
function MusicList() {
  const router = useRouter();
  const [items, setItems] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [musicTypes, setMusicTypes] = useState<string[]>([]);

  useEffect(() => {
    apiFetch<{ music_types: string[] }>(API.musicAttr()).catch(() => ({ music_types: [] })).then(attr => {
      setMusicTypes(attr.music_types || []);
    });
    loadPage(1, '', '');
  }, []);

  const loadPage = async (p: number, q: string, type: string) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    const params: Record<string, string | number> = { page: p, size: 30 };
    if (q) params.q = q;
    if (type) params.music_type = type;
    try {
      const data = await apiFetch<{ items: Music[]; total: number }>(API.musicFilter(params));
      const newItems = data.items || [];
      setItems(prev => p === 1 ? newItems : [...prev, ...newItems]);
      setHasMore(newItems.length === 30);
      setPage(p);
    } catch { }
    setLoading(false);
    setLoadingMore(false);
  };

  const handleType = (t: string) => {
    const next = selectedType === t ? '' : t;
    setSelectedType(next);
    loadPage(1, search, next);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索音乐..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => loadPage(1, search, selectedType)}
          returnKeyType="search"
        />
      </View>
      <View style={styles.typeRow}>
        {musicTypes.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, selectedType === t && styles.typeChipActive]}
            onPress={() => handleType(t)}
          >
            <Text style={[styles.typeChipText, selectedType === t && styles.typeChipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}
          onEndReached={() => { if (!loadingMore && hasMore) loadPage(page + 1, search, selectedType); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} /> : null}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.musicItem, index > 0 && styles.listItemBorder]}
              onPress={() => router.push(`/musicDetail?id=${item.id}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.listIndex}>{index + 1}</Text>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.listItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.listItemSub}>{item.album || '—'} · {formatDate(item.publish_time)}</Text>
              </View>
              <View style={styles.listItemTag}>
                <Text style={styles.listItemTagText}>{item.solo}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

// ─── 视频列表 ───────────────────────────────────────────────────────────────
function VideoList() {
  const router = useRouter();
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [videoTypes, setVideoTypes] = useState<string[]>([]);

  useEffect(() => {
    apiFetch<{ types: string[] }>(API.videoAttr()).catch(() => ({ types: [] })).then(attr => {
      setVideoTypes(attr.types || []);
    });
    loadPage(1, '');
  }, []);

  const loadPage = async (p: number, type: string) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    const params: Record<string, string | number> = { page: p, size: 20 };
    if (type) params.type = type;
    try {
      const data = await apiFetch<{ items: Video[]; total: number }>(API.videoFilter(params));
      const newItems = data.items || [];
      setItems(prev => p === 1 ? newItems : [...prev, ...newItems]);
      setHasMore(newItems.length === 20);
      setPage(p);
    } catch { }
    setLoading(false);
    setLoadingMore(false);
  };

  const handleType = (t: string) => {
    const next = selectedType === t ? '' : t;
    setSelectedType(next);
    loadPage(1, next);
  };

  const colW = (SCREEN_W - Spacing.md * 2 - 8) / 2;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.typeRow}>
        {videoTypes.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, selectedType === t && styles.typeChipActive]}
            onPress={() => handleType(t)}
          >
            <Text style={[styles.typeChipText, selectedType === t && styles.typeChipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: Spacing.md, gap: 8 }}
          columnWrapperStyle={{ gap: 8 }}
          onEndReached={() => { if (!loadingMore && hasMore) loadPage(page + 1, selectedType); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} /> : null}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: colW, borderRadius: BorderRadius.sm, overflow: 'hidden', backgroundColor: Colors.bgCard, elevation: 1 }}
              onPress={() => router.push(`/videoDetail?id=${item.id}`)}
              activeOpacity={0.85}
            >
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: item.cover_url }} style={{ width: colW, aspectRatio: 16 / 9, resizeMode: 'cover' }} />
                {item.duration > 0 && (
                  <View style={styles.videoDuration}>
                    <Text style={styles.videoDurationText}>{formatDuration(item.duration)}</Text>
                  </View>
                )}
              </View>
              <View style={{ padding: Spacing.sm }}>
                <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, lineHeight: 18 }} numberOfLines={2}>{item.name}</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 }}>{formatDate(item.publish_time)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgPage },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  filterBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: 6,
    marginBottom: Spacing.sm,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(180,160,220,0.15)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: FontSize.xs,
    color: Colors.text,
  },
  typeChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    borderRadius: 0,
  },
  listItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  listIndex: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  listItemName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  listItemSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listItemTag: {
    borderWidth: 1,
    borderColor: 'rgba(80,140,200,0.3)',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: Spacing.sm,
    backgroundColor: 'rgba(80,140,220,0.08)',
  },
  listItemTagText: {
    fontSize: 10,
    color: Colors.primaryDark,
  },
  videoDuration: {
    position: 'absolute',
    bottom: 4,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  videoDurationText: {
    color: 'white',
    fontSize: 10,
  },
});
