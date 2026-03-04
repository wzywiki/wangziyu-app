import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { API_BASE } from '../lib/api';

const { width } = Dimensions.get('window');

export default function VideoDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/video/detail?id=${id}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#c084fc" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>加载失败</Text>
      </View>
    );
  }

  // 构建 B 站嵌入 URL
  const bvid = detail.bvid || '';
  const embedUrl = bvid
    ? `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1&danmaku=0`
    : '';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a0a2e', '#0d0118']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{detail.title}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity
              style={styles.openBtn}
              onPress={() => detail.url && Linking.openURL(detail.url)}
            >
              <Text style={styles.openBtnText}>在 B 站观看</Text>
            </TouchableOpacity>
          )}

          {/* 详情 */}
          <View style={styles.infoCard}>
            <Text style={styles.title}>{detail.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.tag}><Text style={styles.tagText}>{detail.type}</Text></View>
              <Text style={styles.date}>{detail.date}</Text>
              {detail.duration && (
                <Text style={styles.duration}> · {detail.duration}</Text>
              )}
            </View>
            {detail.description && (
              <Text style={styles.description}>{detail.description}</Text>
            )}
            {detail.url && (
              <TouchableOpacity onPress={() => Linking.openURL(detail.url)} style={styles.sourceBtn}>
                <Text style={styles.sourceBtnText}>在 B 站观看完整视频</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0118' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0118' },
  errorText: { color: '#c084fc', fontSize: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(138,43,226,0.2)',
  },
  backBtn: { padding: 4, width: 60 },
  backText: { color: '#c084fc', fontSize: 15 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
  playerContainer: { width, height: width * 0.5625, backgroundColor: '#000' },
  player: { flex: 1 },
  openBtn: {
    margin: 16, backgroundColor: 'rgba(192,132,252,0.2)', borderRadius: 10,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.3)',
  },
  openBtnText: { color: '#c084fc', fontSize: 16, fontWeight: '600' },
  infoCard: {
    margin: 16, padding: 16,
    backgroundColor: 'rgba(138,43,226,0.1)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(138,43,226,0.2)',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 },
  tag: {
    backgroundColor: 'rgba(192,132,252,0.2)', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4, marginRight: 8,
  },
  tagText: { color: '#c084fc', fontSize: 13 },
  date: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  duration: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  description: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22, marginBottom: 12 },
  sourceBtn: {
    backgroundColor: 'rgba(192,132,252,0.2)', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.3)',
  },
  sourceBtnText: { color: '#c084fc', fontSize: 14, fontWeight: '600' },
});
