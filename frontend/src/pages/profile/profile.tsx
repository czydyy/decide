import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { authApi } from '@/utils/api';
import { getUser, isLoggedIn, logout as doLogout } from '@/utils/auth';
import './profile.scss';

interface UserProfile {
  id: string;
  nickname: string;
  avatar_url?: string;
  phone?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!isLoggedIn()) {
      setUser(null);
      return;
    }
    try {
      const res = await authApi.profile();
      setUser(res as UserProfile);
    } catch {
      const cached = getUser();
      setUser(cached as UserProfile);
    }
  };

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/login' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          doLogout();
          setUser(null);
          Taro.showToast({ title: '已退出', icon: 'success' });
        }
      },
    });
  };

  const menuItems = [
    { icon: '📖', label: '我的解读', action: 'history' },
    { icon: '⭐', label: '收藏解读', action: 'fav' },
    { icon: '⚙', label: '设置', action: 'settings' },
  ];

  // Not logged in
  if (!user) {
    return (
      <View className="clean-bg prof-page">
        <View className="prof-body">
          <View className="prof-card">
            <View className="prof-avatar">
              <Text className="prof-av-txt">爻</Text>
            </View>
            <Text className="prof-name">未登录</Text>
            <Text className="prof-id">登录后可查看占卜记录</Text>
            <View
              style={{
                marginTop: '24px', height: '48px', background: 'var(--accent)',
                borderRadius: 'var(--radius-md)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '15px', fontWeight: 600,
                letterSpacing: '2px',
              }}
              onClick={handleLogin}
            >
              <Text>登录 / 注册</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="clean-bg prof-page">
      <View className="prof-body">
        {/* Profile card */}
        <View className="prof-card">
          <View className="prof-avatar">
            <Text className="prof-av-txt">{user?.nickname?.[0] || '爻'}</Text>
          </View>
          <Text className="prof-name">{user?.nickname || '爻爻用户'}</Text>
          <Text className="prof-id">ID: {user?.id?.slice(0, 8) || '---'}</Text>

          <View className="prof-stats">
            <View className="prof-stat">
              <Text className="prof-stat-n">12</Text>
              <Text className="prof-stat-l">占卜次数</Text>
            </View>
            <View className="prof-stat">
              <Text className="prof-stat-n">64</Text>
              <Text className="prof-stat-l">已学卦象</Text>
            </View>
            <View className="prof-stat">
              <Text className="prof-stat-n">3</Text>
              <Text className="prof-stat-l">收藏解读</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View className="prof-menu">
          {menuItems.map((item, i) => (
            <View
              key={i}
              className="prof-menu-item"
              onClick={() => {
                if (item.action === 'history') {
                  Taro.navigateTo({ url: '/pages/history/history' });
                } else {
                  Taro.showToast({ title: '功能开发中', icon: 'none' });
                }
              }}
            >
              <Text className="prof-mi">{item.icon}</Text>
              <Text className="prof-ml">{item.label}</Text>
              <Text className="prof-ma">→</Text>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: '16px', height: '48px', background: '#fff',
            borderRadius: 'var(--radius-md)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', fontSize: '15px', fontWeight: 500,
            border: '1px solid var(--clean-border)',
          }}
          onClick={handleLogout}
        >
          <Text>退出登录</Text>
        </View>

        <View className="prof-footer">爻爻 · 以卦明辨</View>
      </View>
    </View>
  );
}
