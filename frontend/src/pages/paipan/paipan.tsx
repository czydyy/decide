import { useEffect, useState } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import './paipan.scss';

interface PaipanData {
  ben_gua: { name: string; symbol: string; gua_ci: string; interpretation: string };
  bian_gua?: { name: string; symbol: string } | null;
  hu_gua?: { name: string; symbol: string } | null;
  zong_gua?: { name: string; symbol: string } | null;
  dong_yao: number[];
  shi_position: number;
  ying_position: number;
  palace: string;
  palace_element: string;
  lines: Array<{
    position: number;
    yao_type: string;
    changing: boolean;
    najia: string;
    liuqin: string;
    liushou: string;
    shiying: string;
  }>;
}

export default function PaipanPage() {
  const router = useRouter();
  const [data, setData] = useState<PaipanData | null>(null);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    try {
      const rawData = router.params.data;
      const rawQuestion = router.params.question || '';
      if (rawData) {
        setData(JSON.parse(decodeURIComponent(rawData)));
        setQuestion(decodeURIComponent(rawQuestion));
      }
    } catch (e) {
      Taro.showToast({ title: '数据加载失败', icon: 'none' });
    }
  }, []);

  if (!data) {
    return (
      <View className="warm-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <View className="loading-spinner" />
      </View>
    );
  }

  const handleInterpret = () => {
    const params = [
      `data=${encodeURIComponent(JSON.stringify(data))}`,
      `question=${encodeURIComponent(question)}`,
    ].join('&');
    Taro.navigateTo({ url: `/pages/chat/chat?${params}` });
  };

  return (
    <ScrollView className="warm-bg paipan-page" scrollY>
      <View className="paipan-nav">
        <View className="paipan-nav-inner">
          <View className="paipan-nav-left" onClick={() => Taro.navigateBack()}>
            <Text className="paipan-nav-back">←</Text>
            <Text className="paipan-nav-title">卦象结果</Text>
          </View>
        </View>
      </View>

      <View className="paipan-body">
        {/* Question banner */}
        {question && (
          <View className="q-banner">
            <Text className="q-banner-lbl">占问</Text>
            <Text className="q-banner-txt">{question}</Text>
          </View>
        )}

        {/* Ben Gua hero */}
        <View className="gua-hero">
          <Text className="gua-symbol">{data.ben_gua.symbol}</Text>
          <Text className="gua-name">{data.ben_gua.name}</Text>
          <Text className="gua-sub">{data.palace}宫 · {data.palace_element}</Text>
          <Text className="gua-ci">卦辞：{data.ben_gua.gua_ci}</Text>
        </View>

        {/* Yao table */}
        <View className="yao-card">
          <Text className="section-title">爻象推演</Text>
          <View className="yao-table">
            <View className="yao-row yao-hdr">
              <Text className="yao-col col-pos">位</Text>
              <Text className="yao-col col-sym">爻</Text>
              <Text className="yao-col col-nj">纳甲</Text>
              <Text className="yao-col col-lq">六亲</Text>
              <Text className="yao-col col-ls">六兽</Text>
              <Text className="yao-col col-sy">世应</Text>
            </View>
            {[...data.lines].reverse().map((line) => (
              <View key={line.position} className={`yao-row ${line.changing ? 'chg' : ''}`}>
                <Text className="yao-col col-pos">{line.position}</Text>
                <Text className="yao-col col-sym">{line.yao_type === 'yang' ? '—' : '-- --'}{line.changing ? ' ○' : ''}</Text>
                <Text className="yao-col col-nj">{line.najia}</Text>
                <Text className="yao-col col-lq">{line.liuqin}</Text>
                <Text className="yao-col col-ls">{line.liushou}</Text>
                <Text className={`yao-col col-sy ${line.shiying}`}>{line.shiying}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Transformed guas */}
        {(data.bian_gua || data.hu_gua || data.zong_gua) && (
          <View className="tf-grid">
            {data.bian_gua && (
              <View className="tf-item">
                <Text className="tf-lbl">变卦</Text>
                <Text className="tf-sym">{data.bian_gua.symbol}</Text>
                <Text className="tf-nm">{data.bian_gua.name}</Text>
              </View>
            )}
            {data.hu_gua && (
              <View className="tf-item">
                <Text className="tf-lbl">互卦</Text>
                <Text className="tf-sym">{data.hu_gua.symbol}</Text>
                <Text className="tf-nm">{data.hu_gua.name}</Text>
              </View>
            )}
            {data.zong_gua && (
              <View className="tf-item">
                <Text className="tf-lbl">综卦</Text>
                <Text className="tf-sym">{data.zong_gua.symbol}</Text>
                <Text className="tf-nm">{data.zong_gua.name}</Text>
              </View>
            )}
          </View>
        )}

        {/* Interpret CTA */}
        <View className="paipan-to-chat" onClick={handleInterpret}>
          <Text>查看 AI 解读 →</Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}
