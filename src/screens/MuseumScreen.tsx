import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator, TextInput, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API, apiFetch, MuseumItem, formatDate } from '@/lib/api';
import { Colors, Spacing, FontSize, BorderRadius } from '@/lib/theme';

const { width: SCREEN_W } = Dimensions.get('window');

export default function MuseumScreen() {
  const router = useRouter();
  const [items, setItems] = useState<MuseumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    apiFetch<{ types: string[] }>(API.museumAttr()).catch(() => ({ types: [] })).then(attr => {
      setTypes(attr.types || []);
    });
    loadPage(1, '');
  }, []);

  const loadPage = async (p: number, type: string) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    const params: Record<string, string | number> = { page: p, size: 20 };
    if (type) params.type = type;
    try {
      const data = await apiFetch<{ items: MuseumItem[]; total: number }>(API.museumFilter(params));
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>博物馆</Text>
        <Text style={styles.headerSub}>王梓钰的周边与收藏品</Text>
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
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: Spacing.md, gap: 10 }}
          columnWrapperStyle={{ gap: 10 }}
          onEndReached={() => { if (!loadingMore && hasMore) loadPage(page + 1, selectedType); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} /> : null}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { width: colW }]}
              onPress={() => router.push(`/museumDetail?id=${item.id}`)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.cover_url }} style={{ width: colW, aspectRatio: 1, resizeMode: 'cover' }} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeTagText}>{item.type}</Text>
                  </View>
                  <Text style={styles.cardDate}>{item.year}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
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
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
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
  typeChipText: { fontSize: FontSize.xs, color: Colors.text },
  typeChipTextActive: { color: 'white', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    elevation: 2,
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardInfo: { padding: Spacing.sm },
  cardName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  typeTag: {
    backgroundColor: 'rgba(124,92,191,0.12)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeTagText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  cardDate: { fontSize: 10, color: Colors.textMuted },
});
