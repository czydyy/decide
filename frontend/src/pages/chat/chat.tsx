import { useEffect, useState, useRef } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { conversationApi, streamConversation } from '@/utils/api';
import './chat.scss';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  created_at?: string;
}

interface PaipanSummary {
  ben_gua: { name: string; symbol: string; gua_ci?: string };
  bian_gua?: { name: string; symbol: string } | null;
  hu_gua?: { name: string; symbol: string } | null;
  zong_gua?: { name: string; symbol: string } | null;
  dong_yao: number[];
  lines: Array<{ position: number; yao_type: string; changing: boolean; najia: string; liuqin: string; liushou: string; shiying: string }>;
}

export default function ChatPage() {
  const router = useRouter();
  const [convId, setConvId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [loading, setLoading] = useState(true);
  const [paipan, setPaipan] = useState<PaipanSummary | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    initConversation();
  }, []);

  const initConversation = async () => {
    try {
      const rawData = router.params.data;
      const rawQuestion = router.params.question || '';

      if (rawData) {
        const paipanData = JSON.parse(decodeURIComponent(rawData));
        const question = decodeURIComponent(rawQuestion);

        const result: any = await conversationApi.create({
          question: question || '综合决策',
          category: '综合决策',
          method: 'manual',
          hexagram_index: paipanData.ben_gua?.index || 1,
          dong_yao: paipanData.dong_yao || [],
          day_gan: '甲',
          month_zhi: '子',
          day_zhi: '午',
        });

        setConvId(result.conversation_id);
        setPaipan(result.paipan);

        const initialContent = question || '请帮我解读这个卦象';

        const userMsg: Message = {
          id: 'init',
          role: 'user',
          content: initialContent,
        };
        setMessages([userMsg]);
        startStreaming(result.conversation_id, initialContent);
      } else {
        Taro.showToast({ title: '请先起卦', icon: 'none' });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
    } catch (err: any) {
      Taro.showToast({ title: err.message || '初始化失败', icon: 'none' });
      setLoading(false);
    }
  };

  const startStreaming = (id: string, content: string) => {
    setStreaming(true);
    setStreamingText('');
    setLoading(false);

    abortRef.current = streamConversation(
      id,
      content,
      (chunk) => {
        setStreamingText((prev) => prev + chunk);
      },
      () => {
        setStreamingText((final) => {
          if (final) {
            const assistantMsg: Message = {
              id: `reply-${Date.now()}`,
              role: 'assistant',
              content: final,
            };
            setMessages((prev) => [...prev, assistantMsg]);
          }
          return '';
        });
        setStreaming(false);
      },
      (err) => {
        Taro.showToast({ title: err.message || '请求失败', icon: 'none' });
        setStreaming(false);
      },
    );
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || streaming || !convId) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    startStreaming(convId, text);
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('【') || line.startsWith('**')) {
        return <Text key={i} className="msg-bold">{line.replace(/\*\*/g, '')}</Text>;
      }
      return <Text key={i} className="msg-line">{line || ' '}</Text>;
    });
  };

  const subtitle = paipan
    ? `${paipan.ben_gua.name} · 动爻第${paipan.dong_yao?.[0] || '?'}位`
    : '';

  return (
    <View className="chat-page">
      {/* Header */}
      <View className="chat-header">
        <View className="chat-hdr-back" onClick={() => Taro.navigateBack()}>
          <Text>←</Text>
        </View>
        <View className="chat-hdr-info">
          <Text className="chat-hdr-title">AI 解读</Text>
          {subtitle && <Text className="chat-hdr-subtitle">{subtitle}</Text>}
        </View>
      </View>

      {/* Messages */}
      <ScrollView className="chat-msgs" scrollY>
        <View className="chat-msgs-inner">
          {loading && (
            <View style={{ textAlign: 'center', padding: '60px 0' }}>
              <View className="loading-spinner" />
              <Text style={{ display: 'block', fontSize: '14px', color: 'var(--ink-dim)', marginTop: '16px' }}>正在推演卦象...</Text>
            </View>
          )}

          {messages.map((msg) => (
            <View key={msg.id} className={`msg-row ${msg.role}`}>
              <View className={`msg-bubble ${msg.role}`}>
                {formatContent(msg.content)}
              </View>
            </View>
          ))}

          {streaming && streamingText && (
            <View className="msg-row assistant">
              <View className="msg-bubble assistant">
                {formatContent(streamingText)}
                <View className="streaming-dot" />
              </View>
            </View>
          )}

          {streaming && !streamingText && (
            <View className="msg-row assistant">
              <View className="msg-bubble assistant">
                <View className="typing-dots">
                  <View className="typing-dot" />
                  <View className="typing-dot" />
                  <View className="typing-dot" />
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      {/* Input area */}
      <View className="chat-input-wrap">
        <View className="chat-input-row">
          <Input
            className="chat-input"
            placeholder="继续提问…"
            placeholderClass="chat-input-ph"
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            onConfirm={handleSend}
            maxlength={500}
          />
          <View
            className={`chat-send ${inputValue.trim() && !streaming ? 'active' : ''}`}
            onClick={handleSend}
          >
            <Text>↑</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
