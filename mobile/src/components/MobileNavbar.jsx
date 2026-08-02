import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { navigationRef, navigate } from '../navigation/navigationRef';
import styles from './MobileNavbar.styles';

const logo = require('../../assets/logo.png');

const MobileNavbar = () => {
  const { user, logout, openLogin, openSignup } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [active, setActive] = useState('Home');
  const slide = useState(() => new Animated.Value(320))[0];

  useEffect(() => {
    Animated.timing(slide, {
      toValue: menuOpen ? 0 : 320,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [menuOpen, slide]);

  useEffect(() => {
    const id = setInterval(() => {
      const route = navigationRef.current?.getCurrentRoute?.();
      if (route?.name && route.name !== active) {
        setActive(route.name === 'Shell' ? 'Home' : route.name);
      }
    }, 400);
    return () => clearInterval(id);
  }, [active]);

  const closeMenu = () => {
    setMenuOpen(false);
    setShowUserMenu(false);
  };

  const goTab = (tabName, moreScreen) => {
    closeMenu();
    if (moreScreen) {
      navigate('Shell', {
        screen: 'More',
        params: { screen: moreScreen },
      });
      return;
    }
    navigate('Shell', { screen: tabName });
  };

  const requireAuth = (tabName) => {
    if (!user) {
      closeMenu();
      openLogin();
      return;
    }
    goTab(tabName);
  };

  const handleLogout = async () => {
    await logout();
    closeMenu();
    goTab('Home');
  };

  const LinkItem = ({ label, tab, more, auth }) => {
    const routeName = more || tab;
    const isActive = active === routeName;
    return (
      <Pressable
        onPress={() => {
          if (auth) requireAuth(tab);
          else if (more) goTab('More', more);
          else goTab(tab);
        }}
        style={[styles.link, isActive && styles.linkActive]}
      >
        <Text style={{ color: isActive ? '#fff' : '#e8ecef', fontSize: 16, fontWeight: '500' }}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      <View style={styles.safe}>
        <View style={styles.bar}>
          <Pressable style={styles.logoRow} onPress={() => goTab('Home')}>
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.logoText}>Agapora</Text>
          </Pressable>

          <Pressable
            style={styles.toggle}
            onPress={() => setMenuOpen((o) => !o)}
            accessibilityLabel={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <View style={styles.toggleBar} />
            <View style={styles.toggleBar} />
            <View style={styles.toggleBar} />
          </Pressable>
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={closeMenu}>
        <View style={{ flex: 1 }}>
          <Pressable style={styles.backdrop} onPress={closeMenu} />
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slide }] }]}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
              <View style={styles.menu}>
                <LinkItem label="Home" tab="Home" />
                <LinkItem label="Help" tab="More" more="Help" />
                <LinkItem label="Breed" tab="Breed" auth />
                <LinkItem label="About" tab="More" more="About" />
                <LinkItem label="Birds" tab="Birds" auth />
                {user ? (
                  <>
                    {user.role === 'admin' ? (
                      <LinkItem label="Admin" tab="More" more="Admin" auth />
                    ) : null}
                    <LinkItem label="My Pairs" tab="Pairs" auth />
                  </>
                ) : null}
              </View>

              <View style={styles.auth}>
                {!user ? (
                  <>
                    <Pressable
                      style={styles.loginBtn}
                      onPress={() => {
                        closeMenu();
                        openLogin();
                      }}
                    >
                      <Text style={styles.loginText}>Login</Text>
                    </Pressable>
                    <Pressable
                      style={styles.signupBtn}
                      onPress={() => {
                        closeMenu();
                        openSignup();
                      }}
                    >
                      <Text style={styles.signupText}>Sign Up</Text>
                    </Pressable>
                  </>
                ) : (
                  <View>
                    <Pressable
                      style={styles.userBtn}
                      onPress={() => setShowUserMenu((v) => !v)}
                    >
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                      </View>
                      <Text style={styles.userName} numberOfLines={1}>
                        {user.name || 'User'}
                      </Text>
                    </Pressable>
                    {showUserMenu ? (
                      <View style={styles.dropdown}>
                        <Pressable
                          style={styles.dropdownItem}
                          onPress={() => requireAuth('Pairs')}
                        >
                          <Text style={styles.dropdownText}>My Breeding Pairs</Text>
                        </Pressable>
                        <Pressable
                          style={styles.dropdownItem}
                          onPress={() => requireAuth('Breed')}
                        >
                          <Text style={styles.dropdownText}>New Breeding Pair</Text>
                        </Pressable>
                        {user.role === 'admin' ? (
                          <Pressable
                            style={styles.dropdownItem}
                            onPress={() => {
                              if (!user) {
                                openLogin();
                                return;
                              }
                              goTab('More', 'Admin');
                            }}
                          >
                            <Text style={styles.dropdownText}>Admin Panel</Text>
                          </Pressable>
                        ) : null}
                        <View style={styles.divider} />
                        <Pressable style={styles.dropdownItem} onPress={handleLogout}>
                          <Text style={styles.logoutText}>Logout</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

export default MobileNavbar;
