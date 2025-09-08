import React, { useState } from 'react'
import { Grid, Paper, Typography, Box } from '@mui/material'
import { motion } from 'framer-motion'
import SecurityIcon from '@mui/icons-material/Security'
import CompareIcon from '@mui/icons-material/Compare'
import AnalyticsIcon from '@mui/icons-material/Insights'
import GavelIcon from '@mui/icons-material/Gavel'

export default function Features() {
  const cards = [
    { title: 'Phishing Detection', icon: <SecurityIcon sx={{ fontSize: 42 }} />, desc: 'ML-powered URL analysis to detect phishing attempts and scams.' },
    { title: 'Brand Similarity', icon: <CompareIcon sx={{ fontSize: 42 }} />, desc: 'Compare suspect pages against brand references with image, color and text analysis.' },
    { title: 'Explainable AI', icon: <AnalyticsIcon sx={{ fontSize: 42 }} />, desc: 'SHAP and LLM explanations help you understand model decisions.' },
    { title: 'Combined Verdict', icon: <GavelIcon sx={{ fontSize: 42 }} />, desc: 'Ensemble scoring provides a single actionable verdict and risk score.' },
  ]

  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })
    setHoveredIndex(index)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
  }

  return (
    <Box
      id="features"
      sx={{
        position: 'relative',
        py: 8,

      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 6,
          color: '#e6eef8',
          textAlign: 'center',
          fontWeight: 800,
          letterSpacing: 1.5,
        }}
      >
        Features
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {cards.map((c, index) => {
          const isHovered = hoveredIndex === index
          const rotateX = isHovered ? (mousePos.y / 20 - 8) : 0
          const rotateY = isHovered ? (mousePos.x / 20 - 8) : 0

          return (
            <Grid item xs={12} sm={6} md={3} key={c.title}>
              <motion.div
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={handleMouseLeave}
                style={{ perspective: 1400 }}
              >
                <motion.div
                  animate={{
                    scale: isHovered ? 1.04 : 1,
                    rotateX,
                    rotateY,
                    y: isHovered ? -2 : 0, // gentler lift
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  style={{ cursor: 'pointer' }}
                >
                  <Paper
                    sx={{
                      p: 4,
                      height: 300, // taller cards
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: 2,
                      background: 'rgba(25, 35, 55, 0.55)',
                      backdropFilter: 'blur(14px)',
                      border: '1px solid rgba(77,182,172,0.25)',
                      borderRadius: 5,
                      position: 'relative',
                      overflow: 'hidden',
                      color: '#dfe9f3',
                      boxShadow: 'none',
                      transition: 'transform 0.35s ease',
                    }}
                    elevation={0}
                  >
                    {/* gradient glow border effect */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 5,
                        p: '1px',
                        background: isHovered
                          ? 'linear-gradient(135deg, rgba(77,182,172,0.6), rgba(0,200,255,0.35))'
                          : 'transparent',
                        WebkitMask:
                          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        pointerEvents: 'none',
                        transition: 'background 0.4s ease',
                      }}
                    />

                    {/* icon orb */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '50%',
//                         background: 'linear-gradient(145deg, rgba(77,182,172,0.2), rgba(0,200,255,0.15))',
                        boxShadow: 'none',
                        mb: 2,
                        alignSelf: 'center',
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: isHovered ? [1, 1.08, 1] : 1,
                          rotate: isHovered ? [0, 10, -10, 0] : 0,
                        }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {c.icon}
                      </motion.div>
                    </Box>

                    {/* text */}
                    <Typography
                      sx={{ fontWeight: 700, fontSize: '1.2rem', mb: 1, textAlign: 'center' }}
                    >
                      {c.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.85, lineHeight: 1.6, textAlign: 'center' }}
                    >
                      {c.desc}
                    </Typography>
                  </Paper>
                </motion.div>
              </motion.div>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
