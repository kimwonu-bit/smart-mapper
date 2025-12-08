import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Map, MapPin, ArrowRight, Car } from 'lucide-react';
import { Container, Title, Text, Group, Paper, Box, Stack, useMantineTheme } from '@mantine/core';

const MechanismSection = () => {
    const theme = useMantineTheme();

  return (
    <Box component="section" py={100} pos="relative">
      {/* Background glow */}
      <Box 
        pos="absolute" 
        top="50%" 
        left="50%" 
        w="100%" 
        h={300} 
        style={{ 
            transform: 'translate(-50%, -50%)',
            background: theme.colors['neon-blue'][9],
            opacity: 0.1,
            filter: 'blur(100px)',
            zIndex: 0
        }} 
      />
      
      <Container size="xl" pos="relative" style={{ zIndex: 10 }}>
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, margin: "-100px" }}
        >
            <Stack align="center" mb={80}>
                <Title order={2} size="3rem" ta="center">
                    <Text component="span" variant="gradient" gradient={{ from: 'white', to: 'neon-blue.4' }} inherit>
                        매커니즘 흐름
                    </Text>
                </Title>
                <Text c="dimmed">제어에서 시각화까지 끊김 없는 연결.</Text>
            </Stack>
        </motion.div>

        <Group justify="center" align="center" gap={{ base: 20, md: 40 }} wrap="wrap">
            <StepCard 
                icon={<Radio size={40} />} 
                title="초음파 스캔" 
                subtitle="지형 거리 측정" 
                color={theme.colors['neon-blue'][5]}
                delay={0}
            />

            <ConnectionArrow color={theme.colors['neon-blue'][5]} delay={0.3} />

            <StepCard 
                icon={<Map size={40} />} 
                extraIcon={<Car size={20} className="animate-pulse" style={{ color: theme.colors['neon-green'][5], position: 'absolute', top: -5, right: -5 }} />}
                title="지도 데이터 변환" 
                subtitle="실시간 좌표 매핑" 
                color={theme.colors['neon-green'][5]}
                delay={0.6}
            />

            <ConnectionArrow color={theme.colors['neon-blue'][5]} delay={0.9} />

            <StepCard 
                icon={<MapPin size={40} />} 
                title="핀 포인트 기록" 
                subtitle="버튼으로 중요 위치 저장" 
                color={theme.colors['neon-orange'][5]}
                delay={1.2}
            />
        </Group>
      </Container>
    </Box>
  );
};

const StepCard = ({ icon, extraIcon, title, subtitle, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: false, margin: "-100px" }}
      whileHover={{ scale: 1.1, rotate: 5 }}
    >
      <Paper
        p="xl"
        radius="100%"
        w={200}
        h={200}
        style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${color}40`,
            boxShadow: `0 0 30px ${color}20`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        }}
      >
        <Box mb="sm" c={color} pos="relative">
          {icon}
          {extraIcon}
        </Box>
        <Title order={3} size="h4" ta="center" lh={1.2}>{title}</Title>
        <Text size="xs" c="dimmed" ta="center" mt={4}>{subtitle}</Text>
      </Paper>
    </motion.div>
  );
};

const ConnectionArrow = ({ color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      whileInView={{ opacity: 1, width: 100 }} // Fixed width for visualization
      transition={{ duration: 0.5, delay }}
      viewport={{ once: false, margin: "-100px" }}
      style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flex: 1,
          maxWidth: 100,
          minWidth: 50
      }}
      className="hidden md:flex"
    >
      <Box 
        h={2} 
        w="100%" 
        style={{ 
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            position: 'relative',
            overflow: 'hidden'
        }}
      >
         <motion.div 
            animate={{ x: [-100, 100] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '50%', 
                height: '100%', 
                background: 'white', 
                filter: 'blur(2px)' 
            }}
         />
      </Box>
      <ArrowRight size={24} color={color} style={{ marginLeft: 8 }} />
    </motion.div>
  );
};

export default MechanismSection;
