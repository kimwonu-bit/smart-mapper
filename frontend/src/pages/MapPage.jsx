import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, Navigation, ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Container, Grid, Paper, Box, Stack, Group, Title, Text, Button, ActionIcon, Badge, useMantineTheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const MapPage = () => {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [points, setPoints] = useState([]);

    // Generate random points for "obstacles"
    useEffect(() => {
        const newPoints = Array.from({ length: 15 }).map(() => ({
            angle: Math.random() * Math.PI * 2,
            distance: Math.random() * 0.8 + 0.1, // Normalized 0.1 to 0.9
            opacity: Math.random()
        }));
        setPoints(newPoints);
    }, []);

    // Radar Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let angle = 0;
        let animationFrameId;

        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;
            const radius = Math.min(w, h) / 2 - 20;

            // Clear
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, w, h);

            // Draw Grid
            ctx.strokeStyle = '#003300';
            ctx.lineWidth = 1;

            // Circles
            for (let r = 1; r <= 4; r++) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius * (r / 4), 0, Math.PI * 2);
                ctx.stroke();
            }

            // Lines
            for (let a = 0; a < 8; a++) {
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(
                    cx + Math.cos(a * Math.PI / 4) * radius,
                    cy + Math.sin(a * Math.PI / 4) * radius
                );
                ctx.stroke();
            }

            // Draw Points (Obstacles)
            points.forEach(point => {
                const px = cx + Math.cos(point.angle) * point.distance * radius;
                const py = cy + Math.sin(point.angle) * point.distance * radius;

                // Make points glow when sweeper passes nearby
                const diff = (angle - point.angle + Math.PI * 4) % (Math.PI * 2);
                let alpha = 0.2;
                if (diff < 0.5) {
                    alpha = 1 - (diff * 2); 
                }

                ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Sweeper
            const grad = ctx.createConicGradient(angle + Math.PI / 2, cx, cy);
            grad.addColorStop(0, 'rgba(0, 255, 0, 0)');
            grad.addColorStop(0.1, 'rgba(0, 255, 0, 0)');
            grad.addColorStop(0.8, 'rgba(0, 255, 0, 0.1)');
            grad.addColorStop(1, 'rgba(0, 255, 0, 0.4)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, angle, angle + Math.PI / 3); // Sector
            ctx.lineTo(cx, cy); // Should fill circle properly with conic gradient
            // Actually conic gradient fills whole rect usually, let's use arc path for sector if we want specific shape, 
            // but for radar sweep usually we fill whole circle with gradient that has transparency most of the way.
            
            // Simpler sweep line
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
            ctx.stroke();
            
            // Sweep Gradient
            // We'll draw the gradient in the full circle but rotated? NO, simpler to just fill sector
            // Let's stick to the line for simplicity and high performance
            
            angle += 0.02;
            animationFrameId = requestAnimationFrame(draw);
        };

        const resize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        };
        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [points]);

    return (
        <Box h="100vh" style={{ background: '#0a0a0a', color: 'white', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Paper p="xs" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.8)' }}>
                <Group justify="space-between">
                    <Group>
                        <Button variant="subtle" color="gray" leftSection={<ArrowLeft size={18} />} onClick={() => navigate('/camera')}>
                            Camera View
                        </Button>
                        <Text fw={700} tt="uppercase" lts={2} size="sm">
                            <Text component="span" c="neon-green.4">ULTRASONIC MAP</Text>
                        </Text>
                    </Group>
                    <Group>
                        <Badge color="neon-green" variant="outline">SCANNING</Badge>
                    </Group>
                </Group>
            </Paper>

            <Grid gutter={0} style={{ flex: 1 }}>
                
                {/* Controls Sidebar */}
                <Grid.Col span={3} style={{ borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
                    <Stack p="md" gap="xl">
                        <Box>
                            <SectionTitle title="MAPPING CONTROL" color="neon-green.4" />
                            <Stack mt="md">
                                <Button variant="outline" color="gray" leftSection={<RotateCcw size={16} />}>Reset Map</Button>
                                <Button variant="outline" color="gray" leftSection={<ZoomIn size={16} />}>Zoom In</Button>
                                <Button variant="outline" color="gray" leftSection={<ZoomOut size={16} />}>Zoom Out</Button>
                            </Stack>
                        </Box>

                        <Box>
                            <SectionTitle title="SENSOR DATA" color="neon-blue.4" />
                            <Stack mt="md" gap="xs">
                                <DataRow label="FRONT DIST" value="1.24m" />
                                <DataRow label="LEFT DIST" value="0.85m" />
                                <DataRow label="RIGHT DIST" value="2.40m" />
                                <DataRow label="OBSTACLES" value={points.length} />
                            </Stack>
                        </Box>
                    </Stack>
                </Grid.Col>

                {/* Main Radar View */}
                <Grid.Col span={9} pos="relative">
                    <canvas 
                        ref={canvasRef} 
                        style={{ width: '100%', height: '100%', display: 'block' }} 
                    />
                    
                    {/* Overlay Grid UI */}
                    <Box pos="absolute" top={20} left={20}>
                        <Group gap="xs">
                            <Radar size={20} color={theme.colors['neon-green'][5]} />
                            <Text size="xs" c="dimmed">RADAR ACTIVE</Text>
                        </Group>
                    </Box>
                    
                     <Box pos="absolute" bottom={20} right={20} ta="right">
                        <Text size="xs" c="dimmed">GRID SCALE</Text>
                        <Text size="lg" fw={700} c="neon-green.4">50cm / DIV</Text>
                    </Box>
                </Grid.Col>

            </Grid>
        </Box>
    );
};

const SectionTitle = ({ title, color }) => (
    <Text size="xs" fw={700} c={color} tt="uppercase" style={{ borderBottom: `1px solid var(--mantine-color-${color})`, paddingBottom: 4 }}>
        {title}
    </Text>
);

const DataRow = ({ label, value }) => (
    <Group justify="space-between">
        <Text size="xs" c="dimmed">{label}</Text>
        <Text size="sm" fw={600} font="monospace">{value}</Text>
    </Group>
);

export default MapPage;
