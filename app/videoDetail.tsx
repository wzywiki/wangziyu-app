import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { API, apiFetch, Video, formatDate, formatDuration, getBilibiliUrl } from '@/lib/api';
import { Colors, Spacing, FontSize, BorderRadius } from '@/lib/theme';

const { width: SCREEN_W } = Dimensions.get('window');

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiFetch<Video>(API.videoDetail(id)).then(d => {
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

  const bvid = data.sources?.find(s => s.bvid)?.bvid;
  const embedUrl = bvid ? `https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=0&high_quality=1` : null;

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
        {/* 视频播放器 */}
        {embedUrl ? (
          <View style={styles.playerContainer}>
            <WebView
              source={{ uri: embedUrl }}
              style={styles.player}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
            />
          </View>
        ) : (
          <View style={[styles.playerContainer, styles.noPlayer]}>
            <Text style={{ color: Colors.textMuted }}>暂无可播放视频</Text>
          </View>
        )}

        {/* 视频信息 */}
        <View style={styles.infoCard}>
          <Text style={styles.title}>{data.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.typeTag}><Text style={styles.typeTagText}>{data.type}</Text></View>
            <Text style={styles.date}>{formatDate(data.publish_time)}</Text>
            {data.duration > 0 && (
              <Text style={styles.duration}>{formatDuration(data.duration)}</Text>
            )}
          </View>
        </View>

        {/* 外部链接 */}
        {bvid && (
          <View style={styles.linksCard}>
            <Text style={styles.linksTitle}>在其他平台观看</Text>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => Linking.openURL(getBilibiliUrl(bvid))}
            >
              <Text style={styles.linkBtnText}>在 B 站打开</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  playerContainer: {
    width: SCREEN_W,
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
  },
  player: { flex: 1 },
  noPlayer: { justifyContent: 'center', alignItems: 'center' },
  infoCard: {
    margin: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  typeTag: {
    backgroundColor: 'rgba(124,92,191,0.12)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeTagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  date: { fontSize: FontSize.sm, color: Colors.textMuted },
  duration: { fontSize: FontSize.sm, color: Colors.textMuted },
  linksCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  linksTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  linkBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  linkBtnText: { color: 'white', fontWeight: '700', fontSize: FontSize.sm },
});
