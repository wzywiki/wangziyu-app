import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, FlatList, Dimensions, Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API, apiFetch, MuseumItem, formatDate } from '@/lib/api';
import { Colors, Spacing, FontSize, BorderRadius } from '@/lib/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function MuseumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<MuseumItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<MuseumItem>(API.museumDetail(id)).then(d => {
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

  const itemImages = (data.items || []).map(item => item.image_url).filter(Boolean);
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
        {/* 封面 */}
        <Image source={{ uri: data.cover_url }} style={styles.cover} />

        {/* 基本信息 */}
        <View style={styles.infoCard}>
          <Text style={styles.title}>{data.name}</Text>
          <View style={styles.tagRow}>
            <View style={styles.typeTag}><Text style={styles.typeTagText}>{data.type}</Text></View>
            <Text style={styles.date}>{data.year}</Text>
            <Text style={styles.date}>{data.publish_method}</Text>
          </View>

          <View style={styles.detailRows}>
            {data.publish_date && <DetailRow label="发售日期" value={formatDate(data.publish_date)} />}
            {data.item_count > 0 && <DetailRow label="收录数量" value={`${data.item_count} 件`} />}
            {data.item_types?.length > 0 && <DetailRow label="内含类型" value={data.item_types.join('、')} />}
            {data.dimension && (
              <DetailRow label="尺寸" value={`${data.dimension.w} × ${data.dimension.d} × ${data.dimension.h} cm`} />
            )}
          </View>

          {data.note && <Text style={styles.note}>{data.note}</Text>}
        </View>

        {/* 物品图片 */}
        {itemImages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>详细图片 ({itemImages.length})</Text>
            <View style={styles.grid}>
              {itemImages.map((url, i) => (
                <TouchableOpacity key={i} onPress={() => setLightboxIdx(i)}>
                  <Image source={{ uri: url }} style={{ width: colW, height: colW, resizeMode: 'cover', borderRadius: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
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
              data={itemImages}
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  cover: { width: '100%', aspectRatio: 1, resizeMode: 'cover' },
  infoCard: {
    margin: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: Spacing.md },
  typeTag: {
    backgroundColor: 'rgba(124,92,191,0.12)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeTagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  date: { fontSize: FontSize.sm, color: Colors.textMuted },
  detailRows: { gap: 8 },
  detailRow: { flexDirection: 'row', gap: 8 },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textMuted, width: 70 },
  detailValue: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
  note: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginTop: Spacing.sm },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
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
