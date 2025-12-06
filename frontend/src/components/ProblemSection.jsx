import React from 'react';
import { motion } from 'framer-motion';
import { TriangleAlert, UserX, ReceiptText } from 'lucide-react';
import { Container, Title, Text, SimpleGrid, Paper, Stack, Box, ThemeIcon } from '@mantine/core';

const ProblemSection = () => {
  return (
    <Box component="section" pos="relative" py={100} style={{ overflow: 'hidden' }}>
      {/* Warning Background */}
      <Box 
        pos="absolute" 
        inset={0} 
        style={{ 
          background: 'radial-gradient(circle at center, rgba(150, 0, 0, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} 
      />
      <Box 
        pos="absolute" 
        top="50%" 
        left="50%" 
        w={600} 
        h={600} 
        style={{ 
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 0, 0, 0.1)',
            filter: 'blur(150px)',
            borderRadius: '100%',
        }}
      />

      <Container size="xl" pos="relative" style={{ zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, margin: "-100px" }}
        >
            <Stack align="center" mb={60} gap="xs">
                <Title order={2} size="3rem" ta="center">
                    Problem <Text component="span" c="red.6" inherit>Situation</Text>
                </Title>
                <Text c="red.2" size="lg" ta="center" maw={600} opacity={0.8}>
                    Traditional surveying in hazardous environments poses significant risks to human life and incurs high operational costs.
                </Text>
            </Stack>
        </motion.div>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={40}>
          <DangerCard 
            icon={<TriangleAlert size={48} />}
            title="Danger"
            description="High risk of accidents in unstable environments like caves or disaster zones."
            delay={0}
          />
          <DangerCard 
            icon={<UserX size={48} />}
            title="Inaccessibility"
            description="Physical barriers preventing human access to critical survey areas."
            delay={0.2}
          />
          <DangerCard 
            icon={<ReceiptText size={48} />}
            title="High Cost"
            description="Expensive equipment and personnel requirements for manual surveying."
            delay={0.4}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};

const DangerCard = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: false, margin: "-100px" }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
    >
      <Paper
        p="xl"
        radius="lg"
        style={{
            background: 'linear-gradient(180deg, rgba(20,0,0,0.6) 0%, rgba(40,0,0,0.3) 100%)',
            border: '1px solid rgba(255, 50, 50, 0.2)',
            transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        className="group hover:border-red-500/50"
      >
        <Stack gap="md">
            <Box 
                p="md" 
                style={{ 
                    borderRadius: '100%', 
                    background: 'rgba(255, 0, 0, 0.1)', 
                    color: '#ff6b6b', 
                    width: 'fit-content',
                    transition: 'transform 0.3s, background 0.3s, box-shadow 0.3s'
                }}
                className="group-hover:scale-110 group-hover:bg-red-900/40 group-hover:shadow-[0_0_20px_rgba(255,100,100,0.3)]"
            >
                {icon}
            </Box>
            <Title order={3} size="h2" c="red.1">{title}</Title>
            <Text c="red.2" size="sm" lh={1.6} opacity={0.7}>
                {description}
            </Text>
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default ProblemSection;
