import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Map, Video } from 'lucide-react';
import { Container, Grid, Title, Text, Box, Paper, Group, Stack, Image as MantineImage, useMantineTheme } from '@mantine/core';

const IntroSection = () => {
    const theme = useMantineTheme();
    
    return (
        <Box component="section" pos="relative" py={100} style={{ overflow: 'hidden' }}>
            {/* Background Orb */}
            <Box 
                pos="absolute" 
                top="50%" 
                left="50%" 
                style={{ 
                    transform: 'translate(-50%, -50%)',
                    width: 800,
                    height: 800,
                    background: theme.colors['blue'][9],
                    opacity: 0.1,
                    filter: 'blur(120px)',
                    borderRadius: '100%',
                    zIndex: 0
                }}
            />

            <Container size="xl" pos="relative" style={{ zIndex: 10 }}>
                <Grid gutter={80} align="center">
                    {/* Left: Robot Image */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: false, margin: "-100px" }}
                        >
                            <Box pos="relative" className="group">
                                {/* Glow Effect behind image */}
                                <Box 
                                    pos="absolute" 
                                    inset={-4}
                                    style={{
                                        background: `linear-gradient(45deg, ${theme.colors['neon-blue'][5]}, ${theme.colors['neon-green'][5]})`,
                                        borderRadius: theme.radius.xl,
                                        filter: 'blur(10px)',
                                        opacity: 0.3,
                                        transition: 'opacity 0.5s ease'
                                    }}
                                />
                                <Paper 
                                    p={8} 
                                    radius="xl" 
                                    style={{ 
                                        background: 'rgba(255, 255, 255, 0.05)', 
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <MantineImage 
                                        src="/static/images/robot_v2.png" 
                                        alt="Smart Mapper Robot" 
                                        radius="lg"
                                        style={{ transition: 'transform 0.7s ease' }}
                                        className="hover:scale-105"
                                    />
                                    {/* Holographic overlay */}
                                    <Box 
                                        pos="absolute" 
                                        inset={0} 
                                        style={{ 
                                            background: `linear-gradient(to top, ${theme.colors['neon-blue'][5]}20, transparent)`, 
                                            opacity: 0, 
                                            transition: 'opacity 0.5s',
                                            pointerEvents: 'none',
                                            mixBlendMode: 'overlay' 
                                        }}
                                        className="group-hover:opacity-100"
                                    />
                                </Paper>
                            </Box>
                        </motion.div>
                    </Grid.Col>

                    {/* Right: Content */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: false, margin: "-100px" }}
                        >
                            <Paper 
                                p="xl" 
                                radius="xl" 
                                style={{ 
                                    background: 'rgba(255, 255, 255, 0.03)', 
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)' 
                                }}
                            >
                                <Stack gap="lg">
                                    <Title order={2} size="3rem">
                                        <Text component="span" variant="gradient" gradient={{ from: 'white', to: 'neon-blue.4' }} inherit>
                                            프로젝트 소개
                                        </Text>
                                    </Title>
                                    
                                    <Text size="lg" c="dimmed" lh={1.6}>
                                        SMART-MAPPER는 위험하고 접근하기 어려운 환경을 탐색하고 지도를 작성하기 위해 설계된 첨단 로봇 솔루션입니다.
                                        메카넘 휠을 장착하여 모든 방향으로 이동이 가능하며, 다양한 센서를 통해 
                                        <Text component="span" c="neon-green.4" fw={600}> 21세기형 측량사</Text>로서 
                                        인명 피해를 최소화하고 데이터 정확도를 극대화합니다.
                                    </Text>

                                    <Grid mt="md">
                                        <Grid.Col span={4}>
                                            <FeatureIcon icon={<Gamepad2 size={24} />} text="조이스틱 제어" color="neon-blue.5" />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <FeatureIcon icon={<Map size={24} />} text="지도 생성" color="neon-green.5" />
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <FeatureIcon icon={<Video size={24} />} text="실시간 뷰" color="neon-orange.5" />
                                        </Grid.Col>
                                    </Grid>
                                </Stack>
                            </Paper>
                        </motion.div>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

const FeatureIcon = ({ icon, text, color }) => (
    <motion.div whileHover={{ scale: 1.05 }}>
        <Paper 
            p="md" 
            radius="lg" 
            style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'background 0.3s' 
            }}
            className="hover:bg-white/5"
        >
            <Stack align="center" gap="xs">
                <Box c={color}>
                    {icon}
                </Box>
                <Text size="xs" fw={500} c="dimmed" ta="center">{text}</Text>
            </Stack>
        </Paper>
    </motion.div>
);

export default IntroSection;
