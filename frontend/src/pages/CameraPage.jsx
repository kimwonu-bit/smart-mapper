import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Battery, Signal, Wifi, Map, Activity, Power, Video, Crosshair, ChevronLeft } from 'lucide-react';
import { Container, Grid, Paper, Box, Stack, Group, Title, Text, Button, ActionIcon, Progress, RingProgress, Badge, useMantineTheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const CameraPage = () => {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const [batteryLevel, setBatteryLevel] = useState(85);
    const [signalStrength, setSignalStrength] = useState(92);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
            // Simulate slight fluctuations
            setSignalStrength(prev => Math.min(100, Math.max(80, prev + (Math.random() * 4 - 2))));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Box 
            h="100vh" 
            style={{ 
                background: '#0a0a0a', 
                color: 'white',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header / HUD Top Bar */}
            <Paper 
                p="xs" 
                radius={0} 
                style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.1)', 
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 100
                }}
            >
                <Group justify="space-between">
                    <Group>
                        <Button 
                            variant="subtle" 
                            color="gray" 
                            leftSection={<ChevronLeft size={18} />}
                            onClick={() => navigate('/')}
                        >
                            Back
                        </Button>
                        <Text fw={700} tt="uppercase" lts={2} size="sm">
                            <Text component="span" c="neon-blue.4">SMART-MAPPER</Text> // OPERATOR VIEW
                        </Text>
                    </Group>
                    
                    <Group gap="xs">
                        <Button 
                            variant="filled" 
                            color="neon-green" 
                            size="xs"
                            leftSection={<Map size={14} />}
                            onClick={() => navigate('/map')}
                            style={{ boxShadow: '0 0 10px rgba(0, 255, 157, 0.3)' }}
                        >
                            MAP VIEW
                        </Button>
                        <Group gap="xs">
                            <Activity size={16} color={theme.colors['neon-green'][5]} />
                            <Text size="xs" c="dimmed">SYSTEM ONLINE</Text>
                        </Group>
                        <Text size="xs" variant="gradient" gradient={{ from: 'neon-blue.4', to: 'cyan' }} fw={700}>
                            {currentTime}
                        </Text>
                    </Group>
                </Group>
            </Paper>

            {/* Main Content Area */}
            <Grid gutter={0} style={{ flex: 1, height: 'calc(100vh - 60px)' }}>
                
                {/* Left Sidebar: Status */}
                <Grid.Col span={3} style={{ borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)' }}>
                    <Stack p="md" gap="xl" h="100%">
                        
                        {/* Robot Status */}
                        <Box>
                            <SectionTitle title="ROBOT STATUS" color="neon-blue.4" />
                            <Stack mt="md" gap="md">
                                <StatusRow label="BATTERY" value={`${Math.round(batteryLevel)}%`} color="neon-green.5">
                                    <Progress value={batteryLevel} color="neon-green" size="sm" mt={4} />
                                </StatusRow>
                                <StatusRow label="SIGNAL STR" value={`${Math.round(signalStrength)}%`} color="neon-blue.5">
                                    <Progress value={signalStrength} color="neon-blue" size="sm" mt={4} />
                                </StatusRow>
                                <StatusRow label="MOTOR TEMP" value="42°C" color="orange.5" />
                            </Stack>
                        </Box>

                        {/* Connection Info */}
                        <Box>
                             <SectionTitle title="CONNECTION" color="neon-orange.4" />
                             <Group mt="md" grow>
                                 <StatBox label="LATENCY" value="24ms" icon={<Wifi size={14} />} />
                                 <StatBox label="UPTIME" value="00:42:12" icon={<Activity size={14} />} />
                             </Group>
                        </Box>

                        <Box style={{ marginTop: 'auto' }}>
                             <SectionTitle title="CONTROLS" color="gray.5" />
                             <Text size="xs" c="dimmed" mt="xs">
                                 WASD - Movement<br/>
                                 ARROW KEYS - Camera Pan<br/>
                                 SPACE - Emergency Stop
                             </Text>
                        </Box>

                    </Stack>
                </Grid.Col>

                {/* Center: Video Feed */}
                <Grid.Col span={9} pos="relative" style={{ background: '#000' }}>
                    {/* Placeholder for Video Feed */}
                    <Box 
                        w="100%" 
                        h="100%" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)'
                        }}
                    >
                        <Stack align="center" gap="md" style={{ opacity: 0.5 }}>
                            <Box 
                                w={80} h={80} 
                                style={{ 
                                    border: `2px dashed ${theme.colors['neon-blue'][5]}`, 
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center' 
                                }}
                                className="animate-spin-slow"
                            >
                                <Video size={32} color={theme.colors['neon-blue'][5]} />
                            </Box>
                            <Text c="dimmed" size="sm" lts={2}>WAITING FOR VIDEO STREAM...</Text>
                            <Text size="xs" c="dimmed">/video_feed endpoint not connected</Text>
                        </Stack>
                    </Box>

                    {/* Overlay HUD Elements */}
                    <Box pos="absolute" top={20} right={20}>
                        <Badge color="red" variant="dot" size="lg" radius="xs">LIVE FEED</Badge>
                    </Box>

                    <Box pos="absolute" bottom={20} left={20} right={20}>
                         <Group justify="space-between" align="flex-end">
                            <Box w={200} h={150} style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.8)' }}>
                                {/* Mini Map Placeholder */}
                                <Stack align="center" justify="center" h="100%" gap={4}>
                                    <Map size={20} color="gray" />
                                    <Text size="xs" c="dimmed">NO MAP DATA</Text>
                                </Stack>
                            </Box>

                             <Box>
                                <Group gap={5}>
                                    <Badge variant="outline" color="neon-green" radius="xs">CAM 01</Badge>
                                    <Badge variant="outline" color="gray" radius="xs">HD 1080p</Badge>
                                    <Badge variant="outline" color="gray" radius="xs">30 FPS</Badge>
                                </Group>
                             </Box>
                         </Group>
                    </Box>

                    {/* Crosshair Overlay */}
                    <Box pos="absolute" inset={0} style={{ pointerEvents: 'none' }}>
                         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <Crosshair size={40} color="rgba(255,255,255,0.3)" strokeWidth={1} />
                         </div>
                    </Box>
                </Grid.Col>

            </Grid>
        </Box>
    );
};

// HUD Components
const SectionTitle = ({ title, color }) => (
    <Text size="xs" fw={700} c={color} tt="uppercase" style={{ borderBottom: `1px solid var(--mantine-color-${color})`, paddingBottom: 4 }}>
        {title}
    </Text>
);

const StatusRow = ({ label, value, color, children }) => (
    <Box>
        <Group justify="space-between" mb={2}>
            <Text size="xs" c="dimmed">{label}</Text>
            <Text size="sm" fw={600} c="white">{value}</Text>
        </Group>
        {children}
    </Box>
);

const StatBox = ({ label, value, icon }) => (
    <Paper p="xs" radius="sm" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <Group gap="xs">
            {icon}
            <Box>
                <Text size="xs" c="dimmed" lh={1}>{label}</Text>
                <Text size="sm" fw={600} lh={1} mt={2}>{value}</Text>
            </Box>
        </Group>
    </Paper>
);


export default CameraPage;
