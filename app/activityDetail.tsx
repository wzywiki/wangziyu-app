import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, FlatList, Linking, Dimensions, Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API, apiFetch, Activity, formatDate, getActivityPicUrl } from '@/lib/api';
import { Colors, Spacing, FontSize, BorderRadius } from '@/lib/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<Activity>(API.activityDetail(id)).then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
    </SafeAreaView>
  );

  if (!data) return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.center}><Text style={{ color: Colors.textMuted }}>加载失败</Text></View>
    </SafeAreaView>
  );

  const picUrls = (data.pics || []).map(p => getActivityPicUrl(p));
  const colW = (SCREEN_W - Spacing.md * 2 - 8) / 3;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{data.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView>
        <View style={styles.infoCard}>
          <Text style={styles.title}>{data.name}</Text>
          <View style={styles.metaRow}>
            {data.note && <View style={styles.noteTag}><Text style={styles.noteTagText}>{data.note}</Text></View>}
            <Text style={styles.date}>{formatDate(data.time)}</Text>
          </View>
        </View>

        {/* 图片 */}
        {picUrls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>相关图片 ({picUrls.length})</Text>
            <View style={styles.grid}>
              {picUrls.map((url, i) => (
                <TouchableOpacity key={i} onPress={() => setLightboxIdx(i)}>
                  <Image source={{ uri: url }} style={{ width: colW, height: colW, resizeMode: 'cover', borderRadius: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 相关链接 */}
        {(data.url?.length > 0 || data.link?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>相关链接</Text>
            {[...(data.url || []), ...(data.link || [])].map((url, i) => (
              <TouchableOpacity key={i} style={styles.linkItem} onPress={() => Linking.openURL(url)}>
                <Text style={styles.linkText} numberOfLines={1}>{url}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 灯箱 */}
      <Modal visible={lightboxIdx !== null} transparent animationType="fade">
        <View style={styles.lightbox}>
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightboxIdx(null)}>
            <Text style={styles.lightboxCloseText}>✕</Text>
          </TouchableOpacity>
          {lightboxIdx !== null && (
            <FlatList
              data={picUrls}
              horizontal
              pagingEnabled
              initialScrollIndex={lightboxIdx}
              getItemLayout={(_, index) => ({ length: SCREEN_W, offset: SCREEN_W * index, index })}
              keyExtractor={(_, i) => String(i)}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={{ width: SCREEN_W, height: SCREEN_H, resizeMode: 'contain' }} />
              )}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgPage },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bgPage,
  },
  backBtn: { width: 60 },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  navTitle: { flex: 1, textAlign: 'center', fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  infoCard: {
    margin: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  noteTag: {
    backgroundColor: 'rgba(124,92,191,0.1)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  noteTagText: { fontSize: FontSize.xs, color: Colors.primary },
  date: { fontSize: FontSize.sm, color: Colors.textMuted },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  linkItem: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkText: { fontSize: FontSize.xs, color: Colors.primary },
  lightbox: { flex: 1, backgroundColor: 'black' },
  lightboxClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxCloseText: { color: 'white', fontSize: 16 },
});
