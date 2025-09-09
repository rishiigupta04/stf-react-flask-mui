import React, { useState, useEffect } from 'react'
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { useThemeToggle } from '../ThemeContext'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { toggleTheme } = useThemeToggle()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  // track whether the entrance animation has already played
  const hasAnimatedRef = React.useRef(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navigateTo = (id) => {
    try {
      const el = document.getElementById(id)
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
    } catch (e) { }
    // fallback: navigate to homepage with hash
    window.location.href = `/#${id}`
  }

  // Use a single motion wrapper on the AppBar itself to avoid multiple overlapping animations
  const MotionAppBar = motion(AppBar)

  // decide animate props: on first mount play the slide animation, afterwards snap to final state instantly
  const animateProps = hasAnimatedRef.current
    ? { opacity: 1, y: 0, transition: { duration: 0 } }
    : { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }

  React.useEffect(() => {
    // mark that animation has run after first render
    if (!hasAnimatedRef.current) {
      hasAnimatedRef.current = true
    }
  }, [])

  return (
    <MotionAppBar
      initial={{ opacity: 0, y: -28 }}
      animate={animateProps}
      position="fixed"
      color="transparent"
      elevation={isScrolled ? 6 : 0}
      sx={{ background: isScrolled ? 'rgba(15,23,36,0.75)' : 'transparent', backdropFilter: isScrolled ? 'blur(8px)' : 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box component={motion.div} whileHover={{ rotate: 5 }} sx={{ width: 48, height: 48, cursor: 'pointer', display: 'grid', placeItems: 'center' }} onClick={() => { window.location.href = '/' }}>
            {/* Inline SVG simplified for dynamic theming */}
            <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="exposeAI logo">
  <defs>
    <linearGradient id="logoGrad" x1="0" x2="1">
      <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="1" />
      <stop
        offset="100%"
        stopColor={theme.palette.mode === 'dark' ? '#9fe6c2' : '#3aa07a'}
        stopOpacity="1"
      />
    </linearGradient>
  </defs>
  <g fill="none" stroke="none">
    <rect x="4" y="4" width="92" height="92" rx="18" fill="url(#logoGrad)" />
    <g transform="translate(14,18)" fill={theme.palette.background.paper}>
      <rect x="0" y="0" width="24" height="24" rx="6" fill="darkred" />
      <rect x="30" y="0" width="24" height="24" rx="6" />
      <rect x="0" y="30" width="24" height="24" rx="6" />
      {/* Circle instead of 4th rect */}
      <rect x="30" y="30" width="24" height="24" rx="6" fill="darkgreen" />
    </g>
  </g>
</svg>
          </Box>

          <Typography
  variant="caption"
  onClick={() => { window.location.href = '/' }}
  sx={{
    cursor: 'pointer',
    display: { xs: 'none', md: 'block' },
    color: theme => theme.palette.text.primary,
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: 0.3,
  }}
>
  EXPOSE
  <Box component="span" sx={{ color: '#81c784' }}>
    .AI
  </Box>
</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Button color="inherit" onClick={() => navigateTo('features')} sx={{ color: theme => theme.palette.text.primary, textTransform: 'none' }}>Features</Button>
          <Button color="inherit" onClick={() => navigateTo('how-it-works')} sx={{ color: theme => theme.palette.text.primary, textTransform: 'none' }}>How It Works</Button>
{/*           <Button color="inherit" onClick={() => navigateTo('demo')} sx={{ color: theme => theme.palette.text.primary, textTransform: 'none' }}>Live Demo</Button> */}
          <Button variant="contained" color="primary" onClick={() => navigateTo('demo')} sx={{ ml: 1, px: 3 }}>Live Demo</Button>

          {/* Uncomment to restore theme toggle in the navbar */}
          {/* <IconButton onClick={toggleTheme} sx={{ color: theme => theme.palette.text.primary }} aria-label="toggle theme"> */}
          {/*   {isDark ? <Brightness7 /> : <Brightness4 />} */}
          {/* </IconButton> */}
        </Box>
      </Toolbar>
    </MotionAppBar>
  )
}
