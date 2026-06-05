import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Textarea, Input } from '@tarojs/components';
import { qiguaApi } from '@/utils/api';
import { isLoggedIn } from '@/utils/auth';
import './index.scss';

const CHIPS = [
  '我该不该换工作？',
  '要不要买这套房子？',
  '这个时机创业合适吗？',
  '这次投资能成功吗？',
];

const methods = [
  { key: 'yao' as const, label: '铜钱起卦', desc: '传统六爻，掷钱成卦', icon: '🪙' },
  { key: 'number' as const, label: '数字起卦', desc: '随心取数，以数推象', icon: '🔢' },
  { key: 'time' as const, label: '时间起卦', desc: '即刻推演，应时而动', icon: '🕐' },
];

const features = [
  { icon: '☯', title: '六爻正统', desc: '基于传统纳甲筮法，京房八宫卦体系，保证卦象推演的准确性' },
  { icon: '🤖', title: 'AI 深度解读', desc: '结合大语言模型，从卦辞、爻辞、世应、六亲多维度解析' },
  { icon: '🔮', title: '即时起卦', desc: '支持铜钱、数字、时间三种起卦方式，随时随地寻求指引' },
];

export default function IndexPage() {
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState<'yao' | 'number' | 'time'>('yao');
  const [numbers, setNumbers] = useState({ n1: '', n2: '', n3: '' });
  const [loading, setLoading] = useState(false);

  const canStart = question.trim()
    ? (method === 'number' ? +numbers.n1 > 0 && +numbers.n2 > 0 && +numbers.n3 > 0 : true)
    : false;

  const openForm = (m?: 'yao' | 'number' | 'time') => {
    if (m) setMethod(m);
    setShowForm(true);
  };

  const handleStart = async () => {
    if (!canStart || loading) return;
    setLoading(true);
    try {
      const base: Record<string, unknown> = { method, day_gan: '甲' };
      if (method === 'number') {
        base.n1 = +numbers.n1;
        base.n2 = +numbers.n2;
        base.n3 = +numbers.n3;
      }
      const result = await qiguaApi.paipan(base);
      const query = [
        `data=${encodeURIComponent(JSON.stringify(result))}`,
        `question=${encodeURIComponent(question)}`,
      ].join('&');
      Taro.navigateTo({ url: `/pages/paipan/paipan?${query}` });
    } catch (err: any) {
      Taro.showToast({ title: err.message || '起卦失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const loggedIn = isLoggedIn();

  return (
    <View className="page">
      {/* ==================== NAV ==================== */}
      <View className="nav">
        <View className="nav-inner">
          <View className="nav-brand" onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}>
            <Text className="nav-icon">☯</Text>
            <Text className="nav-logo">爻爻</Text>
          </View>
          <View className="nav-links">
            <Text className="nav-link" onClick={() => Taro.navigateTo({ url: '/pages/history/history' })}>
              历史记录
            </Text>
            <Text className="nav-link" onClick={() => Taro.navigateTo({ url: '/pages/profile/profile' })}>
              {loggedIn ? '我的' : '登录'}
            </Text>
          </View>
        </View>
      </View>

      {/* ==================== HERO ==================== */}
      <View className="hero">
        <View className="hero-badge">
          <Text>AI × 周易</Text>
        </View>
        <Text className="hero-title">
          两难之间，<Text className="hero-title-accent">以卦明辨</Text>
        </Text>
        <Text className="hero-desc">
          传承千年六爻智慧，融合现代 AI 技术，为你解读每一个卦象背后的深意
        </Text>
        <View className="hero-actions">
          <View className="hero-cta" onClick={() => openForm()}>
            <Text className="hero-cta-icon">☯</Text>
            <Text>开始起卦</Text>
          </View>
          <View className="hero-cta-outline" onClick={() => Taro.navigateTo({ url: '/pages/history/history' })}>
            <Text>查看历史</Text>
          </View>
        </View>
      </View>

      {/* ==================== FEATURES ==================== */}
      <View className="features">
        <View className="features-inner">
          <Text className="section-label">核心能力</Text>
          <Text className="section-heading">为什么选择爻爻</Text>
          <View className="features-grid">
            {features.map((f) => (
              <View key={f.title} className="feature-card">
                <View className="feature-icon-wrap">
                  <Text className="feature-icon">{f.icon}</Text>
                </View>
                <Text className="feature-title">{f.title}</Text>
                <Text className="feature-desc">{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ==================== METHODS ==================== */}
      <View className="methods-section">
        <View className="methods-inner">
          <Text className="section-label">起卦方式</Text>
          <Text className="section-heading">选择适合你的方式</Text>
          <View className="methods-grid">
            {methods.map((m) => (
              <View key={m.key} className="method-card" onClick={() => openForm(m.key)}>
                <Text className="method-icon">{m.icon}</Text>
                <Text className="method-name">{m.label}</Text>
                <Text className="method-desc">{m.desc}</Text>
                <View className="method-arrow">
                  <Text>开始 →</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ==================== FORM OVERLAY ==================== */}
      {showForm && (
        <View className="overlay">
          <View className="overlay-mask" onClick={() => setShowForm(false)} />
          <View className="overlay-panel">
            {/* Header */}
            <View className="panel-header">
              <Text className="panel-title">起卦解惑</Text>
              <Text className="panel-subtitle">静心凝神，将你的困惑娓娓道来</Text>
              <View className="panel-close" onClick={() => setShowForm(false)}>
                <Text>×</Text>
              </View>
            </View>

            {/* Question */}
            <View className="panel-field">
              <Text className="panel-label">你的困惑</Text>
              <View className="panel-textarea-wrap">
                <Textarea
                  className="panel-textarea"
                  placeholder="写下你正在纠结的事情……"
                  placeholderClass="panel-textarea-ph"
                  value={question}
                  onInput={(e) => setQuestion(e.detail.value)}
                  maxlength={200}
                  autoHeight
                />
              </View>
              <Text className="panel-count">{question.length}/200</Text>
            </View>

            {/* Method */}
            <View className="panel-field">
              <Text className="panel-label">起卦方式</Text>
              <View className="panel-tabs">
                {methods.map((m) => (
                  <View
                    key={m.key}
                    className={`panel-tab ${method === m.key ? 'panel-tab--on' : ''}`}
                    onClick={() => setMethod(m.key)}
                  >
                    <Text>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Number inputs */}
            {method === 'number' && (
              <View className="panel-nums">
                {([
                  { label: '上卦', key: 'n1' as const, hint: '1-8' },
                  { label: '下卦', key: 'n2' as const, hint: '1-8' },
                  { label: '动爻', key: 'n3' as const, hint: '1-6' },
                ]).map((n) => (
                  <View className="panel-num-cell" key={n.key}>
                    <Text className="panel-num-lbl">{n.label}</Text>
                    <Input
                      className="panel-num-inp"
                      type="number"
                      placeholder={n.hint}
                      value={numbers[n.key]}
                      onInput={(e) =>
                        setNumbers({ ...numbers, [n.key]: e.detail.value })
                      }
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Chips */}
            <View className="panel-chips">
              <Text className="panel-chips-label">试试这些问题</Text>
              <View className="panel-chips-row">
                {CHIPS.map((t) => (
                  <View
                    key={t}
                    className={`panel-chip ${question === t ? 'panel-chip--on' : ''}`}
                    onClick={() => setQuestion(t)}
                  >
                    <Text>{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Submit */}
            <View
              className={`panel-submit ${canStart ? '' : 'panel-submit--off'} ${loading ? 'panel-submit--load' : ''}`}
              onClick={handleStart}
            >
              <Text>{loading ? '起卦中…' : '起卦解惑'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* ==================== FOOTER ==================== */}
      <View className="footer">
        <View className="footer-inner">
          <View className="footer-brand">
            <Text className="footer-brand-icon">☯</Text>
            <Text className="footer-brand-name">爻爻</Text>
          </View>
          <Text className="footer-tagline">以千年智慧，解今日困惑</Text>
          <Text className="footer-copy">© 2024 爻爻 · 六爻决策助手</Text>
        </View>
      </View>
    </View>
  );
}
