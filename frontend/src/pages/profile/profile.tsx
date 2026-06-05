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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    if (!isLoggedIn()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.profile();
      setUser(res as UserProfile);
    } catch {
      const cached = getUser();
      setUser(cached as UserProfile);
    } finally {
      setLoading(false);
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

  return (
    <View className="clean-bg prof-page">
      {/* Nav */}
      <View className="subnav">
        <View className="subnav-inner">
          <View className="subnav-brand" onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}>
            <Text className="subnav-icon">☯</Text>
            <Text className="subnav-logo">爻爻</Text>
          </View>
        </View>
      </View>

      <View className="prof-body">
        {loading ? (
          <View className="loading-spinner" />
        ) : !user ? (
          /* ===== Not logged in ===== */
          <View className="prof-hero-card">
            <View className="prof-avatar">
              <Text className="prof-av-txt">爻</Text>
            </View>
            <Text className="prof-name">未登录</Text>
            <Text className="prof-sub">登录后可查看占卜记录</Text>
            <View className="prof-login-btn" onClick={handleLogin}>
              <Text>登录 / 注册</Text>
            </View>
          </View>
        ) : (
          /* ===== Logged in ===== */
          <>
            <View className="prof-hero-card">
              <View className="prof-avatar">
                <Text className="prof-av-txt">{user.nickname?.[0] || '爻'}</Text>
              </View>
              <Text className="prof-name">{user.nickname || '爻爻用户'}</Text>
              {user.phone && (
                <Text className="prof-sub">{user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>
              )}

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

            <View className="prof-logout-btn" onClick={handleLogout}>
              <Text>退出登录</Text>
            </View>

            <View className="prof-footer">爻爻 · 以卦明辨</View>
          </>
        )}
      </View>
    </View>
  );
}
