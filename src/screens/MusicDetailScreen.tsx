import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE } from '../lib/api';

const { width } = Dimensions.get('window');

export default function MusicDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [detail, setDetail] = useState<any>(null);
  const [lyric, setLyric] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/music/detail?id=${id}`).then(r => r.json()),
      fetch(`${API_BASE}/music/lyric?id=${id}`).then(r => r.text()).catch(() => ''),
    ]).then(([d, l]) => {
      setDetail(d);
      setLyric(l);
      setLoading(false);
    }).catch(() => setLoading(false));
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

  // 解析 LRC 歌词
  const parsedLyric = lyric
    ? lyric.split('\n')
        .filter(line => /\[\d+:\d+/.test(line))
        .map(line => line.replace(/\[.*?\]/g, '').trim())
        .filter(Boolean)
    : [];

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
          {/* 封面 */}
          {detail.cover && (
            <View style={styles.coverContainer}>
              <Image source={{ uri: detail.cover }} style={styles.cover} />
              <LinearGradient
                colors={['transparent', '#0d0118']}
                style={styles.coverGradient}
              />
            </View>
          )}

          {/* 基本信息 */}
          <View style={styles.infoCard}>
            <Text style={styles.title}>{detail.title}</Text>
            <View style={styles.metaRow}>
              {detail.album && (
                <View style={styles.tag}><Text style={styles.tagText}>{detail.album}</Text></View>
              )}
              {detail.type && (
                <View style={[styles.tag, styles.tagSecondary]}>
                  <Text style={styles.tagText}>{detail.type}</Text>
                </View>
              )}
              <Text style={styles.date}>{detail.date}</Text>
            </View>
            {detail.description && (
              <Text style={styles.description}>{detail.description}</Text>
            )}

            {/* 平台链接 */}
            <View style={styles.platformRow}>
              {detail.netease && (
                <TouchableOpacity
                  style={styles.platformBtn}
                  onPress={() => Linking.openURL(detail.netease)}
                >
                  <Text style={styles.platformText}>网易云</Text>
                </TouchableOpacity>
              )}
              {detail.qqmusic && (
                <TouchableOpacity
                  style={styles.platformBtn}
                  onPress={() => Linking.openURL(detail.qqmusic)}
                >
                  <Text style={styles.platformText}>QQ 音乐</Text>
                </TouchableOpacity>
              )}
              {detail.kugou && (
                <TouchableOpacity
                  style={styles.platformBtn}
                  onPress={() => Linking.openURL(detail.kugou)}
                >
                  <Text style={styles.platformText}>酷狗</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 歌词 */}
          {parsedLyric.length > 0 && (
            <View style={styles.lyricCard}>
              <Text style={styles.lyricTitle}>歌词</Text>
              {parsedLyric.map((line, idx) => (
                <Text key={idx} style={styles.lyricLine}>{line}</Text>
              ))}
            </View>
          )}
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
  coverContainer: { position: 'relative' },
  cover: { width, height: width, backgroundColor: '#1a0a2e' },
  coverGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  infoCard: {
    margin: 16, padding: 16,
    backgroundColor: 'rgba(138,43,226,0.1)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(138,43,226,0.2)',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 },
  tag: {
    backgroundColor: 'rgba(192,132,252,0.2)', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4, marginRight: 8, marginBottom: 4,
  },
  tagSecondary: { backgroundColor: 'rgba(99,102,241,0.2)' },
  tagText: { color: '#c084fc', fontSize: 13 },
  date: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  description: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22, marginBottom: 12 },
  platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  platformBtn: {
    backgroundColor: 'rgba(192,132,252,0.2)', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.3)',
  },
  platformText: { color: '#c084fc', fontSize: 13, fontWeight: '600' },
  lyricCard: {
    marginHorizontal: 16, marginBottom: 16, padding: 16,
    backgroundColor: 'rgba(138,43,226,0.05)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(138,43,226,0.15)',
  },
  lyricTitle: { color: '#c084fc', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  lyricLine: {
    color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 26,
    textAlign: 'center',
  },
});
