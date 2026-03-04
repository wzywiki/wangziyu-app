import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE } from '../lib/api';

const { width } = Dimensions.get('window');

export default function MuseumDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/museum/detail?id=${id}`)
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

  const images = detail.images || (detail.cover ? [detail.cover] : []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a0a2e', '#0d0118']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{detail.name}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {images.length > 0 && (
            <View>
              <Image source={{ uri: images[currentImg] }} style={styles.mainImage} resizeMode="cover" />
              {images.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbList}>
                  {images.map((img: string, idx: number) => (
                    <TouchableOpacity key={idx} onPress={() => setCurrentImg(idx)}>
                      <Image
                        source={{ uri: img }}
                        style={[styles.thumb, currentImg === idx && styles.thumbActive]}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.title}>{detail.name}</Text>
            <View style={styles.metaRow}>
              {detail.category && (
                <View style={styles.tag}><Text style={styles.tagText}>{detail.category}</Text></View>
              )}
              {detail.year && (
                <Text style={styles.date}>{detail.year}</Text>
              )}
            </View>
            {detail.description && (
              <Text style={styles.description}>{detail.description}</Text>
            )}
            {detail.source && (
              <View style={styles.sourceRow}>
                <Text style={styles.sourceLabel}>来源：</Text>
                <Text style={styles.sourceText}>{detail.source}</Text>
              </View>
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
  mainImage: { width, height: width, backgroundColor: '#1a0a2e' },
  thumbList: { paddingHorizontal: 12, paddingVertical: 10 },
  thumb: { width: 64, height: 64, borderRadius: 8, marginRight: 8, opacity: 0.6 },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: '#c084fc' },
  infoCard: {
    margin: 16, padding: 16,
    backgroundColor: 'rgba(138,43,226,0.1)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(138,43,226,0.2)',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 },
  tag: {
    backgroundColor: 'rgba(192,132,252,0.2)', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4, marginRight: 8,
  },
  tagText: { color: '#c084fc', fontSize: 13 },
  date: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  description: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22, marginBottom: 12 },
  sourceRow: { flexDirection: 'row', alignItems: 'center' },
  sourceLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  sourceText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, flex: 1 },
});
