import React from 'react'
import { Box, Typography, Button } from '@mui/material'

export default function Hero({ onCta }){
  return (
    <Box sx={{ py:8, background: 'linear-gradient(180deg, rgba(7,17,38,1) 0%, rgba(15,23,36,1) 100%)', color: '#e6eef8' }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', alignItems: 'center', gap: 4, px: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>Spot the Fake — AI-Powered Phishing & Website Fraud Detection</Typography>
          <Typography variant="h6" sx={{ color: 'rgba(230,238,248,0.8)', mb: 4 }}>Protect your users and brand with advanced ML + LLM-powered threat detection. Fast, explainable, and easy to integrate.</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={onCta}>Try Demo</Button>
            <Button variant="outlined" color="inherit" onClick={() => window.open('https://github.com/', '_blank')}>View on GitHub</Button>
          </Box>
        </Box>

        <Box sx={{ width: 420, display: { xs: 'none', md: 'block' } }}>
          {/* Simple illustrative SVG */}
          <svg width="100%" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#4db6ac" />
                <stop offset="1" stopColor="#81c784" />
              </linearGradient>
            </defs>
            <rect rx="12" width="100%" height="100%" fill="#071126" />
            <g transform="translate(40,30)">
              <path d="M50 0 L90 30 L50 60 L10 30 Z" fill="url(#g1)" opacity="0.95" />
              <circle cx="150" cy="35" r="30" fill="#e57373" opacity="0.95" />
              <rect x="120" y="80" width="80" height="10" rx="4" fill="#fff" opacity="0.06" />
            </g>
          </svg>
        </Box>
      </Box>
    </Box>
  )
}

