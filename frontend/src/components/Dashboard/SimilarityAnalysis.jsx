import React from 'react'
import { Paper, Typography, Box, LinearProgress, Grid } from '@mui/material'

export default function SimilarityAnalysis({ simResult, simLoading, simError }){
  // support both shapes: { success, result } or direct result object
  const result = simResult?.result ?? simResult
  const score = result?.score ?? null
  const details = result?.details ?? {}

  return (
    <Paper sx={{ p:2, background: '#071126', color: '#e6eef8' }} elevation={2}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Website Similarity</Typography>
      <Typography variant="caption" sx={{ opacity: 0.8 }}>Image, color & text similarity</Typography>

      <Box sx={{ mt:2 }}>
        {simLoading && <Typography>Checking similarity...</Typography>}
        {simError && <Typography color="error">{String(simError)}</Typography>}

        {score !== null && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{Math.round(score*100)}%</Typography>
            <Box sx={{ width: '100%', mt:1 }}>
              <LinearProgress variant="determinate" value={score*100} sx={{ height: 10, borderRadius: 2 }} />
            </Box>

            <Grid container spacing={1} sx={{ mt:2 }}>
              {['image','color','text'].map((k)=> (
                <Grid item xs={12} key={k}>
                  <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{k}</Typography>
                    <Typography variant="body2">{(details[k] ?? 0).toFixed(3)}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
              {result?.reference_image && (
                <img src={`http://localhost:5000/static/brands/${result.reference_image.split(/[/\\]/).pop()}`} alt="ref" style={{ maxWidth: 120, borderRadius: 6 }} />
              )}
              {result?.user_screenshot && (
                <img src={`http://localhost:5000/static/user/${result.user_screenshot.split(/[/\\]/).pop()}`} alt="user" style={{ maxWidth: 120, borderRadius: 6 }} />
              )}
            </Box>
          </Box>
        )}

        {!simLoading && score === null && !simError && (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>No similarity analysis available. Try taking a similarity check.</Typography>
        )}
      </Box>
    </Paper>
  )
}
