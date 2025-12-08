import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Globe } from 'lucide-react';
import { Container, Grid, Title, Text, Paper, Box, Stack, useMantineTheme } from '@mantine/core';

const AdvantagesSection = () => {
    const theme = useMantineTheme();
    
    return (
        <Box component="section" py={100} pos="relative">
            <Container size="xl">
                <Grid gutter={50}>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <AdvantageCard 
                            icon={<Gamepad2 size={64} />}
                            title="편리한 제어"
                            description="거친 지형에서도 정밀한 기동이 가능하도록 자이로 센서나 조이스틱 버튼을 사용한 직관적인 조향."
                            color={theme.colors['neon-blue'][5]}
                            delay={0}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <AdvantageCard 
                            icon={<Globe size={64} />}
                            title="웹 연결성"
                            description="웹 브라우저를 통한 실시간 데이터 스트리밍 및 제어. 복잡한 소프트웨어 설치가 필요 없습니다."
                            color={theme.colors['neon-green'][5]}
                            delay={0.2}
                        />
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

const AdvantageCard = ({ icon, title, description, color, delay }) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay }}
        viewport={{ once: false, margin: "-100px" }}
        whileHover={{ y: -10 }}
        style={{ height: '100%' }}
    >
      <Paper
        p={50}
        radius="xl"
        style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${color}40`,
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
        }}
        className="group"
      >
        {/* Hover Gradient Overlay */}
        <Box 
            pos="absolute"
            inset={0}
            style={{ 
                background: `linear-gradient(135deg, ${color}30, transparent 40%)`,
                opacity: 0,
                transition: 'opacity 0.5s ease'
            }}
            className="group-hover:opacity-100"
        />

        <Stack align="center" ta="center" gap="lg" pos="relative" style={{ zIndex: 10 }}>
            <Box 
                p="lg" 
                style={{ 
                    borderRadius: '100%', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    color: color,
                    boxShadow: `0 0 40px ${color}30`,
                    transition: 'transform 0.5s ease'
                }}
                className="group-hover:scale-110"
            >
                {icon}
            </Box>
            
            <Title order={3} size="2.5rem">{title}</Title>
            
            <Text size="lg" c="dimmed" lh={1.6}>
                {description}
            </Text>
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default AdvantagesSection;
