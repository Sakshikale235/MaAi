import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Hop as Home, Users, TriangleAlert as AlertTriangle, ClipboardList, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon Icon={Home} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon Icon={Users} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon Icon={AlertTriangle} size={size} color={color} focused={focused} badge={7} />
          ),
        }}
      />
      <Tabs.Screen
        name="mo"
        options={{
          title: 'MO Review',
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon Icon={ClipboardList} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon Icon={Settings} size={size} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  Icon,
  size,
  color,
  focused,
  badge,
}: {
  Icon: React.ComponentType<{ size: number; color: string }>;
  size: number;
  color: string;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Icon size={size - 2} color={color} />
      {badge && !focused && (
        <View style={styles.badge}>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EEF2',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    shadowColor: 'rgba(14, 124, 134, 0.15)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
  },
  tabLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, marginTop: 2 },
  tabItem: { paddingTop: 4 },
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'relative',
  },
  iconWrapActive: { backgroundColor: Colors.primaryLight },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.risk.high,
  },
});
