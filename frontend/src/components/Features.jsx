import React from 'react'
import { Grid, Paper, Typography, Box } from '@mui/material'
import SecurityIcon from '@mui/icons-material/Security'
import CompareIcon from '@mui/icons-material/Compare'
import AnalyticsIcon from '@mui/icons-material/Insights'
import GavelIcon from '@mui/icons-material/Gavel'

export default function Features(){
  const cards = [
    { title: 'Phishing Detection', icon: <SecurityIcon sx={{ fontSize: 36 }} />, desc: 'ML-powered URL analysis to detect phishing attempts and scams.' },
    { title: 'Brand Similarity', icon: <CompareIcon sx={{ fontSize: 36 }} />, desc: 'Compare suspect pages against brand references with image, color and text analysis.' },
    { title: 'Explainable AI', icon: <AnalyticsIcon sx={{ fontSize: 36 }} />, desc: 'SHAP and LLM explanations help you understand model decisions.' },
    { title: 'Combined Verdict', icon: <GavelIcon sx={{ fontSize: 36 }} />, desc: 'Ensemble scoring provides a single actionable verdict and risk score.' },
  ]

  return (
    <Box id="features">
      <Typography variant="h5" sx={{ mb: 3, color: '#e6eef8' }}>Features</Typography>
      <Grid container spacing={2}>
        {cards.map(c=> (
          <Grid item xs={12} sm={6} md={3} key={c.title}>
            <Paper sx={{ p:2, height: '100%', background: '#071126', color: '#dfe9f3' }} elevation={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 56, height: 56, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>{c.icon}</Box>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{c.title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>{c.desc}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

