import React, { useState, Suspense } from 'react'
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  CssBaseline,
} from '@mui/material'
import axios from 'axios'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import PhishingAnalysis from './components/Dashboard/PhishingAnalysis'
import SimilarityAnalysis from './components/Dashboard/SimilarityAnalysis'

// Lazy-load FinalVerdict to optimize initial load
const FinalVerdict = React.lazy(() => import('./components/Dashboard/FinalVerdict'))

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
}

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [simResult, setSimResult] = useState(null)
  const [simLoading, setSimLoading] = useState(false)
  const [simError, setSimError] = useState(null)

  const handleSubmit = async (e) => {
    e && e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setSimResult(null)

    try {
      const resp = await axios.post('http://localhost:5000/predict', { url })
      const r = resp.data?.result ?? resp.data
      setResult(r)
    } catch (err) {
      setError(err.response?.data || err.message)
    } finally {
      setLoading(false)
    }

    setSimLoading(true)
    setSimError(null)
    try {
      const sresp = await axios.post('http://localhost:5000/similarity', { url })
      const s = sresp.data?.result ?? sresp.data
      setSimResult(s)
    } catch (errSim) {
      setSimError(errSim.response?.data || errSim.message)
    } finally {
      setSimLoading(false)
    }
  }

  return (
    <>
      <CssBaseline />
      <Navbar />

      {/* Hero with fade-in */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <Hero
          onCta={() =>
            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
          }
        />
      </motion.div>

      <Container maxWidth="lg" sx={{ mt: 6 }}>
        {/* Features with scroll animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <Features />
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          id="how-it-works"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          sx={{ mt: 6 }}
        >
          <HowItWorks />
        </motion.div>

        {/* Demo Section */}
        <Box id="demo" sx={{ mt: 6, borderRadius: 3 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <Paper
              sx={{
                p: 4,
              background: '#0f1724',
                color: (theme) => theme.palette.text.primary,
              }}
              elevation={3}
            >
              <Typography variant="h6" gutterBottom>
                Live Demo — Analyze a Website
              </Typography>

              {/* Input Form */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}
              >
                <TextField
                  fullWidth
                  label="Enter URL or text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  sx={{
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.03)'
                        : '#fff',
                    input: { color: 'inherit' },
                  }}
                />
                <Button variant="contained" type="submit" disabled={loading || simLoading}>
                  Analyze
                </Button>
              </Box>

              {/* Results & Feedback */}
              <Box sx={{ mt: 3 }}>
                {/* Loading states */}
                {(loading || simLoading) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} />
                      <Typography>
                        {loading ? 'Analyzing...' : 'Checking similarity...'}
                      </Typography>
                    </Box>
                  </motion.div>
                )}

                {/* Error states */}
                {error && (
                  <Typography color="error">Error: {JSON.stringify(error)}</Typography>
                )}
                {simError && (
                  <Typography color="error">
                    Similarity Error: {JSON.stringify(simError)}
                  </Typography>
                )}

                {/* Results Section */}
                {result && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                  >
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Paper
                        sx={{
                          p: 2,
                          background: (theme) => theme.palette.background.paper,
                          color: (theme) => theme.palette.text.primary,
                        }}
                        elevation={1}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          Phishing Detection
                        </Typography>
                        <PhishingAnalysis result={result} />
                      </Paper>

                      <Paper
                        sx={{
                          p: 2,
                          background: (theme) => theme.palette.background.paper,
                          color: (theme) => theme.palette.text.primary,
                        }}
                        elevation={1}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          Website Similarity
                        </Typography>
                        <SimilarityAnalysis
                          simResult={simResult}
                          simLoading={simLoading}
                          simError={simError}
                        />
                      </Paper>

                      <Paper
                        sx={{
                          p: 2,
                          background: (theme) => theme.palette.background.paper,
                          color: (theme) => theme.palette.text.primary,
                        }}
                        elevation={1}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          Final Combined Analysis
                        </Typography>
                        <Suspense
                          fallback={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 2,
                              }}
                            >
                              <CircularProgress size={24} />
                            </Box>
                          }
                        >
                          <FinalVerdict
                            result={result}
                            similarity={simResult && simResult.score}
                          />
                        </Suspense>
                      </Paper>
                    </Box>
                  </motion.div>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Container>
    </>
  )
}
