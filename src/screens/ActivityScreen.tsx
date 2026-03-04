import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API, apiFetch, Activity, formatDate } from '@/lib/api';
import { Colors, Spacing, FontSize, BorderRadius } from '@/lib/theme';

type TimeTab = 'future' | 'past';

export default function ActivityScreen() {
  const router = useRouter();
  const [timeTab, setTimeTab] = useState<TimeTab>('future');
  const [futureItems, setFutureItems] = useState<Activity[]>([]);
  const [pastItems, setPastItems] = useState<Activity[]>([]);
  const [loadingFuture, setLoadingFuture] = useState(true);
  const [loadingPast, setLoadingPast] = useState(true);

  useEffect(() => {
    apiFetch<{ items: Activity[] }>(API.activityFuture())
      .catch(() => ({ items: [] }))
      .then(data => {
        setFutureItems(data.items || []);
        setLoadingFuture(false);
      });
    apiFetch<{ items: Activity[] }>(API.activityPast())
      .catch(() => ({ items: [] }))
      .then(data => {
        setPastItems(data.items || []);
        setLoadingPast(false);
      });
  }, []);

  const items = timeTab === 'future' ? futureItems : pastItems;
  const loading = timeTab === 'future' ? loadingFuture : loadingPast;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>动态</Text>
      </View>

      {/* 时间切换 */}
      <View style={styles.timeTabs}>
        <TouchableOpacity
          style={[styles.timeTab, timeTab === 'future' && styles.timeTabActive]}
          onPress={() => setTimeTab('future')}
        >
          <Text style={[styles.timeTabText, timeTab === 'future' && styles.timeTabTextActive]}>近期动态</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeTab, timeTab === 'past' && styles.timeTabActive]}
          onPress={() => setTimeTab('past')}
        >
          <Text style={[styles.timeTabText, timeTab === 'past' && styles.timeTabTextActive]}>历史动态</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: Colors.textMuted }}>暂无动态</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: Spacing.md }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.activityItem, index > 0 && styles.itemBorder]}
              onPress={() => router.push(`/activityDetail?id=${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.dateColumn}>
                <Text style={styles.dateMonth}>
                  {new Date(item.time).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.dateYear}>
                  {new Date(item.time).getFullYear()}
                </Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityName} numberOfLines={2}>{item.name}</Text>
                {item.note && (
                  <View style={styles.noteTag}>
                    <Text style={styles.noteTagText}>{item.note}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.arrow}>›</Text>
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
  timeTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  timeTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(180,160,220,0.15)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeTabText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
  timeTabTextActive: { color: 'white', fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: 6,
  },
  itemBorder: {},
  dateColumn: {
    width: 48,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  dateMonth: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  dateYear: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  activityContent: { flex: 1 },
  activityName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
  },
  noteTag: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124,92,191,0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  noteTagText: { fontSize: 10, color: Colors.primary },
  arrow: { fontSize: 20, color: Colors.textMuted, marginLeft: Spacing.sm },
});
