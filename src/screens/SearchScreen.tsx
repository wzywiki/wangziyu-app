import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Image, ActivityIndicator, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API, apiFetch, PicSet, formatDate } from '@/lib/api';
import { Colors, Spacing, FontSize, BorderRadius } from '@/lib/theme';
import { Dimensions } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
type SearchType = 'pic' | 'lyric';

export default function SearchScreen() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<SearchType>('pic');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [picResults, setPicResults] = useState<PicSet[]>([]);
  const [lyricResults, setLyricResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    try {
      if (searchType === 'pic') {
        const data = await apiFetch<{ items: PicSet[] }>(API.picAiSearch('pic', query, 1, 20));
        setPicResults(data.items || []);
      } else {
        const data = await apiFetch<any[]>(API.lyricSearch(query));
        setLyricResults(Array.isArray(data) ? data : []);
      }
    } catch {
      setPicResults([]);
      setLyricResults([]);
    }
    setLoading(false);
  };

  const colW = (SCREEN_W - Spacing.md * 2 - 8) / 3;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>搜索</Text>
      </View>

      {/* 搜索类型切换 */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeChip, searchType === 'pic' && styles.typeChipActive]}
          onPress={() => { setSearchType('pic'); setSearched(false); }}
        >
          <Text style={[styles.typeChipText, searchType === 'pic' && styles.typeChipTextActive]}>AI 搜图</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeChip, searchType === 'lyric' && styles.typeChipActive]}
          onPress={() => { setSearchType('lyric'); setSearched(false); }}
        >
          <Text style={[styles.typeChipText, searchType === 'lyric' && styles.typeChipTextActive]}>歌词搜索</Text>
        </TouchableOpacity>
      </View>

      {/* 搜索框 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={searchType === 'pic' ? '描述图片内容，如"海边写真"...' : '搜索歌词内容...'}
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>搜索</Text>
        </TouchableOpacity>
      </View>

      {/* 结果 */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : !searched ? (
        <View style={styles.center}>
          <Text style={styles.hint}>
            {searchType === 'pic' ? '使用 AI 语义搜索图库，描述你想找的图片' : '搜索王梓钰歌曲的歌词内容'}
          </Text>
        </View>
      ) : searchType === 'pic' ? (
        picResults.length === 0 ? (
          <View style={styles.center}><Text style={{ color: Colors.textMuted }}>未找到相关图库</Text></View>
        ) : (
          <FlatList
            data={picResults}
            numColumns={3}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: Spacing.md, gap: 6 }}
            columnWrapperStyle={{ gap: 6 }}
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
        )
      ) : (
        lyricResults.length === 0 ? (
          <View style={styles.center}><Text style={{ color: Colors.textMuted }}>未找到相关歌词</Text></View>
        ) : (
          <FlatList
            data={lyricResults}
            keyExtractor={(item, i) => String(i)}
            contentContainerStyle={{ padding: Spacing.md }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.lyricItem, index > 0 && { borderTopWidth: 1, borderTopColor: Colors.border }]}
                onPress={() => router.push(`/musicDetail?id=${item.id}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.lyricSong} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.lyricLine} numberOfLines={3}>{item.lyric_snippet}</Text>
              </TouchableOpacity>
            )}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgPage },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  typeRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(180,160,220,0.15)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: { fontSize: FontSize.sm, color: Colors.text },
  typeChipTextActive: { color: 'white', fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  searchBtnText: { color: 'white', fontWeight: '700', fontSize: FontSize.sm },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  lyricItem: {
    paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: 6,
  },
  lyricSong: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  lyricLine: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
