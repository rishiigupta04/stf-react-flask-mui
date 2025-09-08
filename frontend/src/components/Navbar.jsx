import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'

export default function Navbar(){
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ background: 'linear-gradient(90deg,#071126, #0f1724)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <Toolbar sx={{ display:'flex', justifyContent:'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Spot the Fake</Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, color: 'rgba(255,255,255,0.8)' }}>AI-Powered Phishing & Fraud Detection</Typography>
        </Box>
        <Box>
          <Button color="inherit" href="#features" sx={{ color: '#fff' }}>Features</Button>
          <Button color="inherit" href="#demo" sx={{ color: '#fff' }}>Live Demo</Button>
          <Button color="primary" variant="contained" sx={{ ml:2, color: '#fff' }} href="#">Try Demo</Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
