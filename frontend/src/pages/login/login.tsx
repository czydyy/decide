import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { authApi } from '@/utils/api';
import { setToken, setUser } from '@/utils/auth';
import './login.scss';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';
  const canSubmit = isLogin
    ? phone.length === 11 && password.length >= 6
    : phone.length === 11 && password.length >= 6 && password === password2 && smsCode.length >= 4;

  const handleSendSms = async () => {
    if (sending || countdown > 0 || phone.length !== 11) return;
    setSending(true);
    setError('');
    try {
      await authApi.sendSms(phone);
      Taro.showToast({ title: '验证码已发送（dev: 000000）', icon: 'none' });
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || '发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError('');
    try {
      let res: any;
      if (isLogin) {
        res = await authApi.phoneLogin(phone, password);
      } else {
        res = await authApi.register(phone, password, smsCode);
      }
      setToken(res.token);
      setUser({ id: res.id, nickname: res.nickname, phone: res.phone });
      Taro.showToast({ title: isLogin ? '登录成功' : '注册成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 800);
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="login-page">
      <View className="login-body">
        <View className="login-brand">
          <Text className="login-brand-name">爻爻</Text>
        </View>

        <View className="login-tabs">
          <View
            className={`login-tab ${isLogin ? 'login-tab--on' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            <Text>登录</Text>
          </View>
          <View
            className={`login-tab ${mode === 'register' ? 'login-tab--on' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            <Text>注册</Text>
          </View>
        </View>

        <View className="login-field">
          <Text className="login-label">手机号</Text>
          <Input
            className="login-inp"
            placeholder="请输入手机号"
            placeholderClass="login-ph"
            type="number"
            maxlength={11}
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
          />
        </View>

        {!isLogin && (
          <View className="login-field">
            <Text className="login-label">验证码</Text>
            <View className="sms-row">
              <Input
                className="login-inp sms-inp"
                placeholder="请输入验证码"
                placeholderClass="login-ph"
                type="number"
                maxlength={6}
                value={smsCode}
                onInput={(e) => setSmsCode(e.detail.value)}
              />
              <View
                className={`sms-btn ${countdown > 0 || phone.length !== 11 ? 'sms-btn--off' : ''}`}
                onClick={handleSendSms}
              >
                <Text>{countdown > 0 ? `${countdown}s` : '发送验证码'}</Text>
              </View>
            </View>
          </View>
        )}

        <View className="login-field">
          <Text className="login-label">密码</Text>
          <Input
            className="login-inp"
            placeholder="请输入密码（至少6位）"
            placeholderClass="login-ph"
            password
            maxlength={64}
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>

        {!isLogin && (
          <View className="login-field">
            <Text className="login-label">确认密码</Text>
            <Input
              className="login-inp"
              placeholder="请再次输入密码"
              placeholderClass="login-ph"
              password
              maxlength={64}
              value={password2}
              onInput={(e) => setPassword2(e.detail.value)}
            />
          </View>
        )}

        <View
          className={`login-submit ${canSubmit ? '' : 'login-submit--off'}`}
          onClick={handleSubmit}
        >
          <Text>{loading ? '处理中…' : (isLogin ? '登录' : '注册')}</Text>
        </View>

        {error && <Text className="login-error">{error}</Text>}
      </View>
    </View>
  );
}
