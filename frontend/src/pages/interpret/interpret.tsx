import { useEffect, useState, useRef } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import './interpret.scss';

export default function InterpretPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const rawData = router.params.data;
    const rawQuestion = router.params.question || '';
    if (!rawData) {
      setError('缺少排盘数据');
      setLoading(false);
      return;
    }

    const paipanData = JSON.parse(decodeURIComponent(rawData));
    const question = decodeURIComponent(rawQuestion);

    fetchInterpretation(paipanData, question);
  }, []);

  const fetchInterpretation = async (paipanData: any, question: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          category: '综合决策',
          method: 'manual',
          day_gan: '甲',
          month_zhi: '子',
          day_zhi: '午',
          hexagram_index: paipanData.ben_gua.index,
          dong_yao: paipanData.dong_yao || [],
        }),
      });

      if (!res.ok) throw new Error('请求失败');

      const result = await res.json();
      setContent(result.interpretation);
    } catch (err: any) {
      setError(err.message || '获取解读失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPaipan = () => {
    Taro.navigateBack();
  };

  const formatContent = (text: string) => {
    // Split by sections marked with 【】
    return text.split('\n').map((line, i) => {
      if (line.startsWith('【') && line.endsWith('】')) {
        return <Text key={i} className="section-heading">{line}</Text>;
      }
      // Bold text
      if (line.includes('**')) {
        return <Text key={i} className="bold-line">{line.replace(/\*\*/g, '')}</Text>;
      }
      return <Text key={i} className="text-line">{line || ' '}</Text>;
    });
  };

  return (
    <ScrollView className="container" scrollY ref={scrollRef}>
      <View className="interpret-header">
        <Text className="interpret-title">AI 解读</Text>
        <Text className="interpret-subtitle">基于六爻排盘的智能分析</Text>
      </View>

      {loading && (
        <View className="loading-section">
          <View className="loading-spinner" />
          <Text className="loading-text">正在推演卦象...</Text>
          <Text className="loading-hint">AI 正在分析本卦、变卦、六亲、世应、旺衰</Text>
        </View>
      )}

      {error && (
        <View className="error-section">
          <Text className="error-text">{error}</Text>
          <View className="btn-outline" style={{ marginTop: 16 }} onClick={handleBackToPaipan}>
            <Text>返回排盘</Text>
          </View>
        </View>
      )}

      {!loading && !error && content && (
        <View className="interpret-content">
          <View className="gua-card">
            {formatContent(content)}
          </View>
        </View>
      )}

      {/* Actions */}
      {!loading && !error && (
        <View className="action-buttons">
          <View className="btn-outline" onClick={handleBackToPaipan}>
            <Text>查看排盘详情</Text>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
