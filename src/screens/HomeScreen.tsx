import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API, apiFetch, Activity, Music, Video, PicSet, formatDate, formatDuration } from '@/lib/api';
import { Colors, Spacing, FontSize, BorderRadius } from '@/lib/theme';

const { width: SCREEN_W } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [latestPics, setLatestPics] = useState<PicSet[]>([]);
  const [latestMusic, setLatestMusic] = useState<Music[]>([]);
  const [latestVideos, setLatestVideos] = useState<Video[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingPic, setLoadingPic] = useState(true);
  const [loadingMusic, setLoadingMusic] = useState(true);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [picIdx, setPicIdx] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  useEffect(() => {
    apiFetch<PicSet[]>(API.picLatest()).catch(() => []).then(pics => {
      setLatestPics(pics.slice(0, 8));
      setLoadingPic(false);
    });
    apiFetch<Music[]>(API.musicLatest()).catch(() => []).then(music => {
      setLatestMusic(music.slice(0, 8));
      setLoadingMusic(false);
    });
    apiFetch<Video[]>(API.videoLatest()).catch(() => []).then(videos => {
      setLatestVideos(videos.slice(0, 6));
      setLoadingVideo(false);
    });
    apiFetch<Activity[]>(API.activityPast()).catch(() => []).then(past => {
      setActivities(past.slice(0, 8));
      setLoadingActivity(false);
    });
  }, []);

  // 轮播自动切换
  useEffect(() => {
    if (latestPics.length === 0) return;
    const total = Math.min(latestPics.length, 5);
    const timer = setInterval(() => {
      setPicIdx(i => {
        const next = (i + 1) % total;
        carouselRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [latestPics.length]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 顶部标题 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>王梓钰 Wiki</Text>
          <Text style={styles.headerSub}>王梓钰的个人百科</Text>
        </View>

        {/* 图库轮播 */}
        {loadingPic ? (
          <View style={styles.carouselSkeleton} />
        ) : latestPics.length > 0 && (
          <View style={styles.carouselContainer}>
            <FlatList
              ref={carouselRef}
              data={latestPics.slice(0, 5)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
                setPicIdx(idx);
              }}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ width: SCREEN_W }}
                  onPress={() => router.push(`/picDetail?id=${item.id}`)}
                  activeOpacity={0.95}
                >
                  <Image source={{ uri: item.cover_url }} style={styles.carouselImage} />
                  <View style={styles.carouselOverlay}>
                    <Text style={styles.carouselTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.carouselSub}>{formatDate(item.date)} · {item.type}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            {/* 指示点 */}
            <View style={styles.dotsContainer}>
              {latestPics.slice(0, 5).map((_, i) => (
                <View key={i} style={[styles.dot, i === picIdx && styles.dotActive]} />
              ))}
            </View>
          </View>
        )}

        {/* 最新图库 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🖼 最新图库</Text>
            <TouchableOpacity onPress={() => router.push('/resource')}>
              <Text style={styles.sectionMore}>查看全部 &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.picGrid}>
            {loadingPic
              ? Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={styles.picCardSkeleton} />
                ))
              : latestPics.slice(0, 6).map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.picCard}
                    onPress={() => router.push(`/picDetail?id=${p.id}`)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: p.cover_url }} style={styles.picCardImage} />
                    <View style={styles.picCardInfo}>
                      <Text style={styles.picCardName} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.picCardDate}>{formatDate(p.date)}</Text>
                    </View>
                  </TouchableOpacity>
                ))
            }
          </View>
        </View>

        {/* 最新音乐 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎵 最新音乐</Text>
            <TouchableOpacity onPress={() => router.push('/resource')}>
              <Text style={styles.sectionMore}>查看全部 &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listCard}>
            {loadingMusic
              ? Array.from({ length: 5 }).map((_, i) => (
                  <View key={i} style={styles.listItemSkeleton} />
                ))
              : latestMusic.map((m, i) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.listItem, i < latestMusic.length - 1 && styles.listItemBorder]}
                    onPress={() => router.push(`/musicDetail?id=${m.id}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.listIndex}>{i + 1}</Text>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemName} numberOfLines={1}>{m.name}</Text>
                      <Text style={styles.listItemSub}>{m.album || '—'} · {formatDate(m.publish_time)}</Text>
                    </View>
                    <View style={styles.listItemTag}>
                      <Text style={styles.listItemTagText}>{m.solo}</Text>
                    </View>
                  </TouchableOpacity>
                ))
            }
          </View>
        </View>

        {/* 最新视频 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>▶ 最新视频</Text>
            <TouchableOpacity onPress={() => router.push('/resource')}>
              <Text style={styles.sectionMore}>查看全部 &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.videoGrid}>
            {loadingVideo
              ? Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} style={styles.videoCardSkeleton} />
                ))
              : latestVideos.slice(0, 4).map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={styles.videoCard}
                    onPress={() => router.push(`/videoDetail?id=${v.id}`)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.videoThumbContainer}>
                      <Image source={{ uri: v.cover_url }} style={styles.videoThumb} />
                      {v.duration > 0 && (
                        <View style={styles.videoDuration}>
                          <Text style={styles.videoDurationText}>{formatDuration(v.duration)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.videoCardInfo}>
                      <Text style={styles.videoCardName} numberOfLines={2}>{v.name}</Text>
                      <Text style={styles.videoCardDate}>{formatDate(v.publish_time)}</Text>
                    </View>
                  </TouchableOpacity>
                ))
            }
          </View>
        </View>

        {/* 近期动态 */}
        <View style={[styles.section, { marginBottom: Spacing.xl }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⏰ 近期动态</Text>
            <TouchableOpacity onPress={() => router.push('/activity')}>
              <Text style={styles.sectionMore}>查看全部 &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listCard}>
            {loadingActivity
              ? Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} style={styles.listItemSkeleton} />
                ))
              : activities.map((a, i) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.activityItem, i < activities.length - 1 && styles.listItemBorder]}
                    onPress={() => router.push(`/activityDetail?id=${a.id}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.activityName} numberOfLines={1}>{a.name}</Text>
                    <View style={styles.activityMeta}>
                      {a.note && <Text style={styles.activityNote}>{a.note}</Text>}
                      <Text style={styles.activityDate}>{formatDate(a.time)}</Text>
                    </View>
                  </TouchableOpacity>
                ))
            }
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgPage },
  container: { flex: 1, backgroundColor: Colors.bgPage },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  // 轮播
  carouselContainer: { position: 'relative' },
  carouselSkeleton: {
    width: SCREEN_W,
    aspectRatio: 16 / 9,
    backgroundColor: Colors.bgSkeleton,
  },
  carouselImage: {
    width: SCREEN_W,
    aspectRatio: 16 / 9,
    resizeMode: 'cover',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingTop: Spacing.xl,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  },
  carouselTitle: {
    color: 'white',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  carouselSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 16,
    backgroundColor: 'white',
  },
  // 通用 section
  section: { marginTop: Spacing.lg, paddingHorizontal: Spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionMore: {
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  // 图库网格
  picGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  picCard: {
    width: (SCREEN_W - Spacing.md * 2 - 12) / 3,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
  },
  picCardSkeleton: {
    width: (SCREEN_W - Spacing.md * 2 - 12) / 3,
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.bgSkeleton,
  },
  picCardImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    resizeMode: 'cover',
  },
  picCardInfo: { padding: 5 },
  picCardName: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  picCardDate: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  // 列表卡片
  listCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listItemSkeleton: {
    height: 44,
    marginHorizontal: Spacing.md,
    marginVertical: 6,
    borderRadius: 4,
    backgroundColor: Colors.bgSkeleton,
  },
  listIndex: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  listItemContent: { flex: 1, marginLeft: Spacing.sm },
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
  // 视频网格
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  videoCard: {
    width: (SCREEN_W - Spacing.md * 2 - 8) / 2,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  videoCardSkeleton: {
    width: (SCREEN_W - Spacing.md * 2 - 8) / 2,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.bgSkeleton,
    aspectRatio: 16 / 9,
  },
  videoThumbContainer: { position: 'relative' },
  videoThumb: {
    width: '100%',
    aspectRatio: 16 / 9,
    resizeMode: 'cover',
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
  videoCardInfo: { padding: Spacing.sm },
  videoCardName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 18,
  },
  videoCardDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
  // 动态
  activityItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  activityName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },
  activityNote: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  activityDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
