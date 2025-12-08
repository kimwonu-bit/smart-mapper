import React from 'react';
import { motion } from 'framer-motion';
import { Github, Mail } from 'lucide-react';
import { Container, SimpleGrid, Title, Text, Paper, Image, Box, Stack, Group, ActionIcon, useMantineTheme } from '@mantine/core';

const HardwareSection = () => {
  return (
    <Box component="section" py={100} pos="relative">
      <Container size="xl">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, margin: "-100px" }}
        >
            <Title order={2} size="3rem" ta="center" mb={60}>
                필요 <Text component="span" variant="gradient" gradient={{ from: 'white', to: 'neon-blue.4' }} inherit>부품</Text>
            </Title>
        </motion.div>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {hardwareItems.map((item, index) => (
            <HardwareCard key={index} item={item} index={index} />
          ))}
        </SimpleGrid>
      </Container>
      
      <Footer />
    </Box>
  );
};

const hardwareItems = [
    { name: "푸쉬 버튼", desc: "사용자 입력/제어", image: "/static/images/push_button.png" },
    { name: "초음파 센서 (HC-SR04)", desc: "거리 측정", image: "/static/images/ultrasonic_sensor.png" },
    { name: "서보 모터 (SG90)", desc: "각도 제어", image: "/static/images/servo_motor.png" },
    { name: "라즈베리 파이", desc: "메인 컴퓨터", image: "/static/images/raspberry_pi.png" },
];

const HardwareCard = ({ item, index }) => {
  const theme = useMantineTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: false, margin: "-100px" }}
      whileHover={{ y: -5 }}
    >
      <Paper
        p="md"
        radius="lg"
        style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden'
        }}
        className="group hover:bg-white/5 transition-colors"
      >
        <Box 
            h={200} 
            mb="md" 
            style={{ borderRadius: theme.radius.md, overflow: 'hidden', position: 'relative', background: 'black' }}
        >
             <Image 
                src={item.image} 
                alt={item.name} 
                h="100%" 
                w="100%" 
                fit="cover"
                style={{ opacity: 0.8, transition: 'transform 0.5s, opacity 0.5s' }}
                className="group-hover:scale-110 group-hover:opacity-100"
             />
             <Box pos="absolute" inset={0} style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
        </Box>
        
        <Stack gap={4} align="center">
            <Text fw={700} size="lg" c="white" className="group-hover:text-cyan-400 transition-colors">
                {item.name}
            </Text>
            <Text size="sm" c="dimmed">{item.desc}</Text>
        </Stack>
      </Paper>
    </motion.div>
  );
};

const Footer = () => {
    return (
        <Container size="xl" mt={120} pt={40} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Stack align="center" gap="lg">
                <Group gap="lg">
                    <ActionIcon size="xl" radius="xl" variant="light" color="gray">
                        <Github size={24} />
                    </ActionIcon>
                    <ActionIcon size="xl" radius="xl" variant="light" color="gray">
                        <Mail size={24} />
                    </ActionIcon>
                </Group>
                <Text size="sm" c="dimmed">© 2025 Network Project | SMART-MAPPER </Text>
            </Stack>
        </Container>
    );
};

export default HardwareSection;
