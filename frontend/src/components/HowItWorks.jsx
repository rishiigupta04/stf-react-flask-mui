import React from 'react'
import { Box, Container, Typography, Paper, Button } from '@mui/material'
import { motion } from 'framer-motion'

export default function HowItWorks(){
  return (
    <Box id="how-it-works" sx={{ py: 8, background: 'transparent' }}>
      <Container maxWidth="lg">
        <Paper component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, background: theme => theme.palette.background.paper, boxShadow: '0 8px 28px rgba(3,10,18,0.35)' }} elevation={0}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>How it works</Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mb: 3 }}>
                Our pipeline combines fast feature-based ML checks with an LLM-driven contextual review and visual similarity matching. We score a page on multiple axes (structure, content, visuals) and provide an explainable verdict so you can act confidently.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>Try Demo</Button>
                <Button variant="outlined" color="inherit" onClick={() => window.open('/assets/main.png', '_blank')}>Open Image</Button>
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}>
              <motion.img
                src={'/assets/main.png'}
                alt="how it works illustration"
                style={{ width: '100%', maxWidth: 300, borderRadius: 12, boxShadow: '0 20px 60px rgba(2,6,23,0.45)' }}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
              />
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

