import React, { useState, Suspense } from 'react'
import { Container, Box, TextField, Button, Typography, Paper, CircularProgress, CssBaseline } from '@mui/material'
import axios from 'axios'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import PhishingAnalysis from './components/Dashboard/PhishingAnalysis'
import SimilarityAnalysis from './components/Dashboard/SimilarityAnalysis'
// Lazy-load FinalVerdict to avoid bundling recharts/framer-motion into the main chunk
const FinalVerdict = React.lazy(() => import('./components/Dashboard/FinalVerdict'))

export default function App(){
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [simResult, setSimResult] = useState(null)
  const [simLoading, setSimLoading] = useState(false)
  const [simError, setSimError] = useState(null)

  const handleSubmit = async (e) =>{
    e && e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setSimResult(null)
    try{
      const resp = await axios.post('http://localhost:5000/predict', { url })
      // backend returns { success: true, result: { ... } }
      const r = resp.data?.result ?? resp.data
      setResult(r)

      // Automatically run similarity check if predict succeeded
      try {
        setSimLoading(true)
        const sresp = await axios.post('http://localhost:5000/similarity', { url })
        const s = sresp.data?.result ?? sresp.data
        setSimResult(s)
      } catch (errSim) {
        // keep simError for UI
        setSimError(errSim.response?.data || errSim.message)
      } finally {
        setSimLoading(false)
      }

    }catch(err){
      setError(err.response?.data || err.message)
    }finally{
      setLoading(false)
    }
  }

  // Add missing handler for manual similarity check (bound to the 'Check Similarity' button)
  const handleSimilarity = async (e) => {
    e && e.preventDefault()
    setSimLoading(true)
    setSimError(null)
    setSimResult(null)
    try {
      const resp = await axios.post('http://localhost:5000/similarity', { url })
      const s = resp.data?.result ?? resp.data
      setSimResult(s)
    } catch (err) {
      setSimError(err.response?.data || err.message)
    } finally {
      setSimLoading(false)
    }
  }

  return (
    <>
      <CssBaseline />
      <Navbar />
      <Hero onCta={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} />
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Features />

        <Box id="demo" sx={{ mt: 6 }}>
          <Paper sx={{ p: 4, backgroundColor: '#0f1724', color: '#e6eef8' }} elevation={3}>
            <Typography variant="h6" gutterBottom>Live Demo — Analyze a Website</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
              <TextField fullWidth label="Enter URL or text" value={url} onChange={e=>setUrl(e.target.value)} sx={{ background: '#071126', input: { color: '#fff' } }} />
              <Button variant="contained" type="submit" disabled={loading}>Analyze</Button>
              <Button variant="outlined" onClick={handleSimilarity} disabled={simLoading} sx={{ ml: 1 }}>Check Similarity</Button>
            </Box>

            <Box sx={{ mt: 3 }}>
              {loading && <Box sx={{ display:'flex', alignItems:'center', gap:2 }}><CircularProgress size={20} /> <Typography>Analyzing...</Typography></Box>}
              {error && <Typography color="error">Error: {JSON.stringify(error)}</Typography>}
              {result && (
                <Box sx={{ mt:2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  <PhishingAnalysis result={result} />
                  <SimilarityAnalysis simResult={simResult} simLoading={simLoading} simError={simError} />
                  <Suspense fallback={<Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', p:2 }}><CircularProgress size={24} /></Box>}>
                    <FinalVerdict result={result} similarity={simResult && simResult.score} />
                  </Suspense>
                </Box>
              )}

              {simLoading && <Box sx={{ display:'flex', alignItems:'center', gap:2, mt:2 }}><CircularProgress size={20} /> <Typography>Checking similarity...</Typography></Box>}
              {simError && <Typography color="error">Similarity Error: {JSON.stringify(simError)}</Typography>}
            </Box>
          </Paper>
        </Box>

      </Container>
    </>
  )
}
