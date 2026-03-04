import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE } from '../lib/api';

export default function ActivityDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/activity/filter?id=${id}`)
      .then(r => r.json())
      .then(d => {
        const item = Array.isArray(d) ? d[0] : d;
        setDetail(item);
        setLoading(false);
      })
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          <View style={styles.card}>
            <Text style={styles.title}>{detail.title}</Text>
            <View style={styles.metaRow}>
              {detail.type && (
                <View style={styles.tag}><Text style={styles.tagText}>{detail.type}</Text></View>
              )}
              <Text style={styles.date}>{detail.date}</Text>
            </View>
            {detail.location && (
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>{detail.location}</Text>
              </View>
            )}
            {detail.description && (
              <Text style={styles.description}>{detail.description}</Text>
            )}
            {detail.link && (
              <TouchableOpacity onPress={() => Linking.openURL(detail.link)} style={styles.linkBtn}>
                <Text style={styles.linkBtnText}>查看详情</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 图片 */}
          {detail.images && detail.images.map((img: string, idx: number) => (
            <Image key={idx} source={{ uri: img }} style={styles.image} resizeMode="cover" />
          ))}
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
  card: {
    padding: 16, backgroundColor: 'rgba(138,43,226,0.1)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(138,43,226,0.2)', marginBottom: 16,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 },
  tag: {
    backgroundColor: 'rgba(192,132,252,0.2)', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4, marginRight: 8,
  },
  tagText: { color: '#c084fc', fontSize: 13 },
  date: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  locationIcon: { fontSize: 14, marginRight: 4 },
  locationText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  description: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22, marginBottom: 12 },
  linkBtn: {
    backgroundColor: 'rgba(192,132,252,0.2)', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.3)',
  },
  linkBtnText: { color: '#c084fc', fontSize: 14, fontWeight: '600' },
  image: { width: '100%', height: 240, borderRadius: 10, marginBottom: 12 },
});
