import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API, apiFetch, Music, formatDate } from '@/lib/api';
import { Colors, Spacing, FontSize, BorderRadius } from '@/lib/theme';

export default function MusicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Music | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiFetch<Music>(API.musicDetail(id)).then(d => {
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

  const platforms = [
    { name: '网易云', url: data.platform?.netease ? `https://music.163.com/song?id=${data.platform.netease}` : null },
    { name: 'QQ音乐', url: data.platform?.qq_music ? `https://y.qq.com/n/ryqq/songDetail/${data.platform.qq_music}` : null },
    { name: 'B站', url: data.platform?.bilibili ? `https://www.bilibili.com/video/${data.platform.bilibili}` : null },
  ].filter(p => p.url);

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
        {data.cover_url && (
          <Image source={{ uri: data.cover_url }} style={styles.cover} />
        )}

        {/* 基本信息 */}
        <View style={styles.infoCard}>
          <Text style={styles.title}>{data.name}</Text>
          <View style={styles.tagRow}>
            {[data.music_type, data.language, data.solo].filter(Boolean).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.detailRows}>
            {data.album && <DetailRow label="专辑" value={data.album} />}
            {data.publish_time && <DetailRow label="发行时间" value={formatDate(data.publish_time)} />}
            {data.staff?.map((s, i) => (
              <DetailRow key={i} label={s.type} value={s.name} />
            ))}
          </View>

          {data.note && (
            <Text style={styles.note}>{data.note}</Text>
          )}
        </View>

        {/* 播放平台 */}
        {platforms.length > 0 && (
          <View style={styles.platformCard}>
            <Text style={styles.sectionTitle}>在线收听</Text>
            <View style={styles.platformBtns}>
              {platforms.map(p => (
                <TouchableOpacity
                  key={p.name}
                  style={styles.platformBtn}
                  onPress={() => p.url && Linking.openURL(p.url)}
                >
                  <Text style={styles.platformBtnText}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 歌词 */}
        {data.lyric && (
          <View style={styles.lyricCard}>
            <Text style={styles.sectionTitle}>歌词</Text>
            <Text style={styles.lyric}>{data.lyric}</Text>
          </View>
        )}
      </ScrollView>
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
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  tag: {
    backgroundColor: 'rgba(124,92,191,0.12)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  detailRows: { gap: 8 },
  detailRow: { flexDirection: 'row', gap: 8 },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textMuted, width: 70 },
  detailValue: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
  note: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginTop: Spacing.sm },
  platformCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  platformBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  platformBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  platformBtnText: { color: 'white', fontWeight: '700', fontSize: FontSize.sm },
  lyricCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  lyric: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 24 },
});
