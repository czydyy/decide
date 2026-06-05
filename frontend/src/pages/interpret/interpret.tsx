import { useEffect, useState } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { historyApi } from '@/utils/api';
import './interpret.scss';

interface RecordDetail {
  id: string;
  question: string;
  method: string;
  ben_gua_id: number;
  dong_yao: number[];
  paipan_result: {
    ben_gua: { name: string; symbol: string };
    bian_gua?: { name: string; symbol: string } | null;
    palace: string;
    lines: Array<{
      position: number;
      yao_type: string;
      changing: boolean;
      najia: string;
      liuqin: string;
      liushou: string;
      shiying: string;
    }>;
  } | null;
  ai_interpretation: string | null;
  created_at: string;
}

const METHOD_LABELS: Record<string, string> = {
  yao: '铜钱起卦', number: '数字起卦', time: '时间起卦', manual: '手动排盘',
};

export default function InterpretPage() {
  const router = useRouter();
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const recordId = router.params.recordId;
    if (!recordId) {
      setError('缺少记录 ID');
      setLoading(false);
      return;
    }
    fetchRecord(recordId);
  }, []);

  const fetchRecord = async (id: string) => {
    try {
      const data = await historyApi.get(id) as RecordDetail;
      setRecord(data);
    } catch (err: any) {
      setError(err.message || '获取记录失败');
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.match(/^【.+】$/)) {
        return <Text key={i} className="interp-section-heading">{line}</Text>;
      }
      if (line.match(/^\*\*.+\*\*$/)) {
        return <Text key={i} className="interp-bold">{line.replace(/\*\*/g, '')}</Text>;
      }
      return <Text key={i} className="interp-line">{line || ' '}</Text>;
    });
  };

  return (
    <View className="clean-bg interp-page">
      {/* Nav */}
      <View className="subnav">
        <View className="subnav-inner">
          <View className="subnav-brand" onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}>
            <Text className="subnav-icon">☯</Text>
            <Text className="subnav-logo">爻爻</Text>
          </View>
          <View className="subnav-links">
            <Text className="subnav-link" onClick={() => Taro.navigateBack()}>
              ← 返回
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="interp-scroll" scrollY>
        <View className="interp-body">
          {/* Loading */}
          {loading && (
            <View className="interp-loading">
              <View className="loading-spinner" />
              <Text className="interp-loading-text">加载中...</Text>
            </View>
          )}

          {/* Error */}
          {error && (
            <View className="interp-error">
              <Text className="interp-error-text">{error}</Text>
              <View className="interp-error-btn" onClick={() => Taro.navigateBack()}>
                <Text>返回</Text>
              </View>
            </View>
          )}

          {/* Content */}
          {!loading && !error && record && (
            <>
              {/* Meta header */}
              <View className="interp-meta">
                {record.question && (
                  <Text className="interp-question">{record.question}</Text>
                )}
                <View className="interp-meta-row">
                  <Text className="interp-badge">{METHOD_LABELS[record.method] || record.method}</Text>
                  {record.paipan_result?.ben_gua && (
                    <Text className="interp-gua">
                      {record.paipan_result.ben_gua.symbol} {record.paipan_result.ben_gua.name}
                    </Text>
                  )}
                  {record.dong_yao?.length > 0 && (
                    <Text className="interp-dongyao">动爻：第{record.dong_yao.join('、')}位</Text>
                  )}
                </View>
              </View>

              {/* Paipan summary */}
              {record.paipan_result && (record.paipan_result.bian_gua || record.paipan_result.lines?.length > 0) && (
                <View className="interp-paipan-card">
                  <Text className="interp-paipan-label">卦象概要</Text>
                  {record.paipan_result.lines?.length > 0 && (
                    <View className="interp-lines">
                      {[...record.paipan_result.lines].reverse().map((line) => (
                        <View key={line.position} className={`interp-line-row ${line.changing ? 'interp-line-chg' : ''}`}>
                          <Text className="interp-line-pos">{line.position}</Text>
                          <Text className="interp-line-yao">{line.yao_type === 'yang' ? '—' : '-- --'}{line.changing ? ' ○' : ''}</Text>
                          <Text className="interp-line-najia">{line.najia}</Text>
                          <Text className="interp-line-liuqin">{line.liuqin}</Text>
                          <Text className="interp-line-liushou">{line.liushou}</Text>
                          <Text className={`interp-line-shiying ${line.shiying}`}>{line.shiying}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {record.paipan_result.bian_gua && (
                    <Text className="interp-bian">
                      变卦：{record.paipan_result.bian_gua.symbol} {record.paipan_result.bian_gua.name}
                    </Text>
                  )}
                </View>
              )}

              {/* AI Interpretation */}
              {record.ai_interpretation && (
                <View className="interp-content-card">
                  <Text className="interp-content-label">AI 解读</Text>
                  <View className="interp-content-text">
                    {formatContent(record.ai_interpretation)}
                  </View>
                </View>
              )}

              {!record.ai_interpretation && (
                <View className="interp-no-content">
                  <Text>暂无 AI 解读内容</Text>
                </View>
              )}
            </>
          )}

          <View style={{ height: 48 }} />
        </View>
      </ScrollView>
    </View>
  );
}
