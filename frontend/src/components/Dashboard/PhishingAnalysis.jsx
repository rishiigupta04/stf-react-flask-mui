import React from 'react'
import { Paper, Typography, Box, Chip, CircularProgress, List, ListItem, ListItemText } from '@mui/material'
import BugReportIcon from '@mui/icons-material/BugReport'

export default function PhishingAnalysis({ result }){
  if(!result) return null
  const legitScore = Math.max(0, Math.min(1, result.ml_confidence ?? 0))
  const phishingBadge = result.ml_prediction === 'phishing'
  const badgeColor = phishingBadge ? 'error' : 'success'

  return (
    <Paper sx={{ p:2, background: '#071126', color: '#e6eef8' }} elevation={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Phishing Detection</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>ML model (LGBM) analysis</Typography>
        </Box>
        <Chip icon={<BugReportIcon />} label={result.ml_prediction?.toUpperCase()} color={badgeColor} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', my: 2 }}>
        <Box sx={{ width: 88, height: 88, display: 'grid', placeItems: 'center' }}>
          <CircularProgress variant="determinate" value={legitScore * 100} size={72} thickness={5} />
          <Box sx={{ position: 'relative', top: -64 }}>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>{Math.round(legitScore * 100)}%</Typography>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>Legitimacy</Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Confidence & key indicators</Typography>
          <List dense>
            {(result.ml_explanations || []).slice(0,5).map((t, i)=> (
              <ListItem key={i} sx={{ py: 0 }}>
                <ListItemText primary={`• ${t}`} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            ))}
            {(!(result.ml_explanations || []).length) && <ListItem sx={{ py:0 }}><ListItemText primary="No strong ML indicators available." primaryTypographyProps={{ variant: 'body2', sx: { opacity: 0.8 } }} /></ListItem>}
          </List>
        </Box>
      </Box>

      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>LLM Insight</Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>{result.llm_prediction} ({result.llm_risk_level})</Typography>
        {(result.evidence_snippets || []).length > 0 && (
          <List dense sx={{ mt: 1 }}>
            {result.evidence_snippets.slice(0,3).map((s,i)=> (
              <ListItem key={i} sx={{ py:0 }}>
                <ListItemText primary={s} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  )
}

