import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { historyApi } from '@/utils/api';
import './history.scss';

interface RecordItem {
  id: string;
  question?: string;
  method: string;
  ben_gua_name: string;
  dong_yao: number[];
  ai_interpretation?: string;
  is_favorite: boolean;
  created_at: string;
}

const METHOD_LABELS: Record<string, string> = {
  yao: '铜钱起卦',
  number: '数字起卦',
  time: '时间起卦',
  manual: '手动排盘',
};

export default function HistoryPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await historyApi.list(1, 50);
      setRecords(data as any);
    } catch {
      try {
        const local = Taro.getStorageSync('divination_history') || [];
        setRecords(local);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (record: RecordItem) => {
    Taro.navigateTo({ url: `/pages/interpret/interpret?recordId=${record.id}` });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      Taro.showModal({
        title: '确认删除',
        content: '删除后无法恢复',
        success: (res) => resolve(res.confirm),
        fail: () => resolve(false),
      });
    });
    if (!confirmed) return;
    try {
      await historyApi.delete(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      Taro.showToast({ title: '已删除', icon: 'success' });
    } catch {
      Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return iso;
    }
  };

  return (
    <View className="clean-bg hist-page">
      {/* Nav */}
      <View className="subnav">
        <View className="subnav-inner">
          <View className="subnav-brand" onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}>
            <Text className="subnav-icon">☯</Text>
            <Text className="subnav-logo">爻爻</Text>
          </View>
        </View>
      </View>

      <ScrollView className="hist-scroll" scrollY>
        <View className="hist-body">
          <View className="hist-header">
            <Text className="hist-title">历史记录</Text>
            <Text className="hist-sub">过往占卜，随时回顾</Text>
          </View>

          {loading && <View className="loading-spinner" />}

          {!loading && records.length === 0 && (
            <View className="hist-empty">
              <Text className="hist-empty-icon">🔮</Text>
              <Text className="hist-empty-txt">还没有占卜记录</Text>
              <Text className="hist-empty-hint">去首页开始第一次占卜吧</Text>
              <View
                className="hist-empty-btn"
                onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}
              >
                <Text>前往首页</Text>
              </View>
            </View>
          )}

          {!loading && records.map((record) => (
            <View key={record.id} className="hist-card" onClick={() => handleDetail(record)}>
              <View className="hist-card-left">
                <View className="hist-card-gua">
                  <Text>{record.ben_gua_name}</Text>
                </View>
                <Text className="hist-card-meta">
                  {record.dong_yao && reco