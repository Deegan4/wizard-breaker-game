import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle, Path, G } from 'react-native-svg';
import Colors from '@/constants/colors';

interface AnimatedLogoProps {
  size?: number;
}

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  startX: number;
  startY: number;
  delay: number;
  duration: number;
  angle: number;
}

interface OrbLayer {
  offset: number;
  scale: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
}

function generateParticles(count: number, centerX: number, centerY: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = 30 + Math.random() * 20;
    return {
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.5),
      rotation: new Animated.Value(0),
      startX: centerX + Math.cos(angle) * radius,
      startY: centerY + Math.sin(angle) * radius,
      delay: i * 150,
      duration: 2500 + Math.random() * 1000,
      angle,
    };
  });
}

export default function AnimatedLogo({ size = 140 }: AnimatedLogoProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const orbSize = size * 0.5;

  const mainRotation = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.6)).current;
  const innerGlow = useRef(new Animated.Value(0.8)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const shimmerPosition = useRef(new Animated.Value(0)).current;
  
  const particles = useRef<Particle[]>(generateParticles(12, centerX, centerY)).current;
  
  const orbLayers = useRef<OrbLayer[]>([
    { offset: 0, scale: new Animated.Value(1), opacity: new Animated.Value(0.3), rotation: new Animated.Value(0) },
    { offset: 15, scale: new Animated.Value(1.1), opacity: new Animated.Value(0.2), rotation: new Animated.Value(0) },
    { offset: 30, scale: new Animated.Value(1.2), opacity: new Animated.Value(0.1), rotation: new Animated.Value(0) },
  ]).current;

  const runePositions = useMemo(() => {
    const positions: { angle: number; distance: number; delay: number }[] = [];
    for (let i = 0; i < 6; i++) {
      positions.push({
        angle: (i / 6) * Math.PI * 2,
        distance: orbSize * 0.75,
        delay: i * 200,
      });
    }
    return positions;
  }, [orbSize]);

  const runeAnimations = useRef(runePositions.map(() => ({
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.5),
  }))).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(mainRotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(innerGlow, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(innerGlow, {
          toValue: 0.7,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -8,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 8,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(shimmerPosition, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    orbLayers.forEach((layer, index) => {
      Animated.loop(
        Animated.timing(layer.rotation, {
          toValue: index % 2 === 0 ? 1 : -1,
          duration: 15000 + index * 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(layer.opacity, {
            toValue: 0.4 - index * 0.1,
            duration: 2000 + index * 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(layer.opacity, {
            toValue: 0.15 - index * 0.03,
            duration: 2000 + index * 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    particles.forEach((particle) => {
      const animateParticle = () => {
        particle.x.setValue(0);
        particle.y.setValue(0);
        particle.opacity.setValue(0);
        particle.scale.setValue(0.3);

        const endRadius = 60 + Math.random() * 30;
        const endX = Math.cos(particle.angle + Math.random() * 0.5) * endRadius;
        const endY = Math.sin(particle.angle + Math.random() * 0.5) * endRadius;

        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: endX,
            duration: particle.duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: endY,
            duration: particle.duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 0.9,
              duration: particle.duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: particle.duration * 0.8,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: particle.duration * 0.3,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0.2,
              duration: particle.duration * 0.7,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 2,
            duration: particle.duration,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(animateParticle, Math.random() * 500);
        });
      };

      setTimeout(animateParticle, particle.delay);
    });

    runeAnimations.forEach((anim, index) => {
      const animate = () => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 0.8,
              duration: 800,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.back(1.5)),
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(1500),
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 0.5,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(2000 + Math.random() * 1000),
        ]).start(() => animate());
      };

      setTimeout(animate, runePositions[index].delay + Math.random() * 1000);
    });
  }, []);

  const spin = mainRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerTranslate = shimmerPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [-size, size],
  });

  return (
    <View style={[styles.container, { width: size + 40, height: size + 40 }]}>
      <Animated.View
        style={[
          styles.floatWrapper,
          { transform: [{ translateY: floatY }] },
        ]}
      >
        {orbLayers.map((layer, index) => (
          <Animated.View
            key={`layer-${index}`}
            style={[
              styles.orbLayer,
              {
                width: size + layer.offset * 2,
                height: size + layer.offset * 2,
                borderRadius: (size + layer.offset * 2) / 2,
                opacity: layer.opacity,
                transform: [
                  {
                    rotate: layer.rotation.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ['-360deg', '360deg'],
                    }),
                  },
                  { scale: layer.scale },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.4)', 'rgba(59, 130, 246, 0.2)', 'rgba(139, 92, 246, 0.1)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
        ))}

        <Animated.View
          style={[
            styles.glowOuter,
            {
              width: size * 1.4,
              height: size * 1.4,
              borderRadius: size * 0.7,
              opacity: glowOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(147, 51, 234, 0.5)', 'rgba(59, 130, 246, 0.3)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.mainOrb,
            {
              width: orbSize,
              height: orbSize,
              borderRadius: orbSize / 2,
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          <Svg width={orbSize} height={orbSize} viewBox={`0 0 ${orbSize} ${orbSize}`}>
            <Defs>
              <RadialGradient id="orbGradient" cx="35%" cy="35%" r="65%">
                <Stop offset="0%" stopColor="#E0D4FF" stopOpacity="1" />
                <Stop offset="25%" stopColor="#A78BFA" stopOpacity="0.9" />
                <Stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.85" />
                <Stop offset="75%" stopColor="#6D28D9" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#4C1D95" stopOpacity="0.9" />
              </RadialGradient>
              <RadialGradient id="innerGlow" cx="30%" cy="30%" r="50%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <Stop offset="50%" stopColor="#C4B5FD" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="bottomShadow" cx="50%" cy="100%" r="60%">
                <Stop offset="0%" stopColor="#1E1040" stopOpacity="0.6" />
                <Stop offset="100%" stopColor="#1E1040" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={orbSize / 2} cy={orbSize / 2} r={orbSize / 2 - 2} fill="url(#orbGradient)" />
            <Circle cx={orbSize / 2} cy={orbSize / 2} r={orbSize / 2 - 2} fill="url(#bottomShadow)" />
            <Circle cx={orbSize * 0.35} cy={orbSize * 0.35} r={orbSize * 0.25} fill="url(#innerGlow)" />
            <Circle cx={orbSize * 0.3} cy={orbSize * 0.28} r={orbSize * 0.08} fill="rgba(255,255,255,0.7)" />
            <Circle cx={orbSize * 0.42} cy={orbSize * 0.38} r={orbSize * 0.03} fill="rgba(255,255,255,0.5)" />
          </Svg>

          <Animated.View
            style={[
              styles.shimmerOverlay,
              {
                transform: [{ translateX: shimmerTranslate }, { rotate: '45deg' }],
                opacity: innerGlow.interpolate({
                  inputRange: [0.7, 1],
                  outputRange: [0.2, 0.5],
                }),
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.runeRing,
            {
              width: size,
              height: size,
              transform: [{ rotate: spin }],
            },
          ]}
        >
          {runePositions.map((pos, index) => {
            const x = centerX + Math.cos(pos.angle) * pos.distance - 8;
            const y = centerY + Math.sin(pos.angle) * pos.distance - 8;
            return (
              <Animated.View
                key={`rune-${index}`}
                style={[
                  styles.rune,
                  {
                    left: x,
                    top: y,
                    opacity: runeAnimations[index].opacity,
                    transform: [{ scale: runeAnimations[index].scale }],
                  },
                ]}
              >
                <Svg width={16} height={16} viewBox="0 0 16 16">
                  <G fill="none" stroke={Colors.starYellow} strokeWidth="1.5">
                    {index % 3 === 0 && (
                      <>
                        <Path d="M8 2L8 14" />
                        <Path d="M4 6L12 6" />
                        <Path d="M4 10L12 10" />
                      </>
                    )}
                    {index % 3 === 1 && (
                      <>
                        <Path d="M8 2L12 8L8 14L4 8Z" />
                      </>
                    )}
                    {index % 3 === 2 && (
                      <>
                        <Circle cx="8" cy="8" r="5" />
                        <Path d="M8 3L8 13" />
                        <Path d="M3 8L13 8" />
                      </>
                    )}
                  </G>
                </Svg>
              </Animated.View>
            );
          })}
        </Animated.View>

        {particles.map((particle, index) => (
          <Animated.View
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                left: particle.startX - 3,
                top: particle.startY - 3,
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { scale: particle.scale },
                  {
                    rotate: particle.rotation.interpolate({
                      inputRange: [0, 2],
                      outputRange: ['0deg', '720deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.particleInner, { backgroundColor: index % 2 === 0 ? Colors.starYellow : Colors.secondary }]} />
          </Animated.View>
        ))}

        <View style={[styles.shadowEllipse, { width: orbSize * 0.7, top: size - 5 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbLayer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  glowOuter: {
    position: 'absolute',
    overflow: 'hidden',
  },
  mainOrb: {
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.magicPurple,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
      web: {
        boxShadow: `0 0 40px ${Colors.magicPurple}, 0 0 60px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)`,
      },
    }),
  },
  shimmerOverlay: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 30,
  },
  runeRing: {
    position: 'absolute',
  },
  rune: {
    position: 'absolute',
    width: 16,
    height: 16,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
  },
  particleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
      web: {
        boxShadow: '0 0 8px #FFD700',
      },
    }),
  },
  shadowEllipse: {
    position: 'absolute',
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
    transform: [{ scaleY: 0.3 }],
  },
});
