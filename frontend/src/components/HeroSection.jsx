import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Car, MapPin } from 'lucide-react';
import { Container, Grid, Title, Text, Box, Paper, Button, useMantineTheme } from '@mantine/core';

const HeroSection = () => {
  const theme = useMantineTheme();

  return (
    <Box 
      component="section" 
      pos="relative" 
      h="100vh" 
      style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}
    >
      {/* Background Gradients */}
      <Box 
        pos="absolute" 
        top="-10%" 
        left="-10%" 
        w={500} 
        h={500} 
        style={{ 
          background: theme.colors['neon-blue'][5], 
          opacity: 0.2, 
          filter: 'blur(120px)', 
          borderRadius: '100%' 
        }} 
      />
      <Box 
        pos="absolute" 
        bottom="-10%" 
        right="-10%" 
        w={500} 
        h={500} 
        style={{ 
          background: theme.colors['neon-green'][5], 
          opacity: 0.1, 
          filter: 'blur(120px)', 
          borderRadius: '100%' 
        }} 
      />

      <Container size="xl" style={{ zIndex: 10 }}>
        <Grid gutter={50} align="center">
          {/* Left Content */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false }}
              >
                <Title 
                  order={1} 
                  size="5rem" // Fallback
                  fw={900}
                  style={{ 
                    fontSize: 'clamp(3rem, 6vw, 6rem)', 
                    lineHeight: 1.1,
                    letterSpacing: '-2px'
                  }}
                >
                  SMART<br />
                  <Text 
                    component="span" 
                    variant="gradient" 
                    gradient={{ from: 'white', to: 'neon-blue.4', deg: 45 }}
                    inherit
                  >
                    MAPPER
                  </Text>
                </Title>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false }}
              >
                <Text 
                  size="xl" 
                  c="dimmed" 
                  mt="md" 
                  pl="md" 
                  style={{ borderLeft: `4px solid ${theme.colors['neon-blue'][5]}` }}
                >
                  21st Century Surveyor
                </Text>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ position: 'relative', zIndex: 5 }}
              >
                  <Button 
                    component="a" 
                    href="/camera"
                    size="xl" 
                    mt={50}
                    radius="md"
                    variant="gradient" 
                    gradient={{ from: 'neon-blue.5', to: 'cyan.5' }}
                    style={{
                        boxShadow: '0 0 20px rgba(0, 243, 255, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    className="hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all duration-300 transform hover:-translate-y-1"
                  >
                      Get Started
                  </Button>
              </motion.div>
            </Box>
          </Grid.Col>

          {/* Right Content: Floating Cards */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box h={600} w="100%" pos="relative" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FloatingCard 
                icon={<Camera size={48} color={theme.colors['neon-green'][5]} />}
                title="Vision"
                color={theme.colors['neon-green'][5]}
                delay={0}
                style={{ top: 40, right: 80, zIndex: 10 }}
              />
              <FloatingCard 
                icon={<Car size={48} color={theme.colors['neon-blue'][5]} />}
                title="Mobility"
                color={theme.colors['neon-blue'][5]}
                delay={1}
                style={{ top: '40%', left: 40, zIndex: 20, transform: 'scale(1.1)' }}
              />
              <FloatingCard 
                icon={<MapPin size={48} color={theme.colors['neon-orange'][5]} />}
                title="Mapping"
                color={theme.colors['neon-orange'][5]}
                delay={2}
                style={{ bottom: 40, right: 80, zIndex: 200 }} // Raised z-index significantly
              />
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

const FloatingCard = ({ icon, title, color, delay, style }) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <motion.div
      style={{ position: 'absolute', ...style }}
      animate={{ 
        y: [0, -20, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        delay: delay,
        ease: "easeInOut" 
      }}
      whileHover={{ 
         scale: 1.1,
         rotate: 0,
         zIndex: 30,
         transition: { duration: 0.3 }
      }}
      onClick={() => setIsFocused(!isFocused)}
    >
      <Paper
        p="xl"
        radius="lg"
        w={200}
        h={200}
        style={{
          // Use inline style for static properties, animate dynamic ones via motion if needed, 
          // but mixing Paper styles and motion animate is utilized here via inline conditional
          background: isFocused ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: isFocused ? 'blur(4px)' : 'blur(16px)',
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          borderTop: `1px solid ${color}80`,
          boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 0 1px ${color}20`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          cursor: 'pointer',
          transition: 'all 0.5s ease', // Smooth transition for blur and bg
        }}
      >
        <Box 
          p="md" 
          style={{ 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.05)',
            boxShadow: `0 0 20px ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Text size="sm" fw={700} tt="uppercase" opacity={isFocused ? 1 : 0.8} lts={2}>{title}</Text>
      </Paper>
    </motion.div>
  );
};

export default HeroSection;
