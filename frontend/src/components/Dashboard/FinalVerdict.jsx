import React from 'react'
import { Paper, Typography, Box, LinearProgress, Chip } from '@mui/material'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

export default function FinalVerdict({ result, similarity }){
  if(!result) return null
  const lgbm = result.ml_confidence ?? 0
  let similarityScore = similarity ?? null

  // Combine simple weighted score similar to everything.py (weights assumed)
  const weights = { lgbm: 0.5, llm: 0.3, similarity: similarityScore != null ? 0.2 : 0 }
  const weightSum = Object.values(weights).reduce((a,b)=>a+b,0)
  const normalized = Object.fromEntries(Object.entries(weights).map(([k,v])=>[k,v/weightSum]))

  const llm_legit = result.llm_risk_level === 'safe' ? 0.8 : result.llm_risk_level === 'suspicious' ? 0.5 : result.llm_risk_level === 'phishing' ? 0.1 : 0.5
  const scores = { lgbm: lgbm, llm: llm_legit }
  if(similarityScore != null) scores.similarity = similarityScore

  const final = Object.keys(scores).reduce((acc,k)=> acc + (normalized[k]||0)*scores[k], 0)
  const verdict = final >= 0.5 ? 'Legitimate' : 'Phishing'
  const color = final >= 0.5 ? '#4db6ac' : '#e57373'

  // Build chart data for contributions
  const data = Object.keys(scores).map((k, idx) => ({ name: k, value: (normalized[k]||0) * 100 }))
  const COLORS = ['#1976d2', '#81c784', '#ffb74d']

  const recommendation = final >= 0.5
    ? 'This page appears legitimate. Verify sensitive actions and proceed with caution.'
    : 'High risk detected — do not enter credentials. Verify official channels or report the page.'

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Paper sx={{ p:2.25, background: 'linear-gradient(180deg,#061426 0%,#071226 100%)', color: '#e6eef8', borderRadius: 2, boxShadow: '0 6px 18px rgba(2,6,23,0.55)' }} elevation={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Combined Final Analysis</Typography>
            <Typography variant="caption" sx={{ opacity: 0.78 }}>Ensemble: ML model, LLM insight & visual similarity</Typography>
          </Box>
          <Chip label={verdict} sx={{ bgcolor: color, color: '#071226', fontWeight: 800 }} />
        </Box>

        <Box sx={{ mt:2 }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900 }}>{Math.round(final*100)}%</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Overall legitimacy score</Typography>
            </Box>

            <Box sx={{ width: 110, textAlign: 'right' }}>
              <Typography sx={{ color }}>{verdict}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Threshold: 50%</Typography>
            </Box>
          </Box>

          <Box sx={{ mt:2 }}>
            <LinearProgress variant="determinate" value={final*100} sx={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.03)', '& .MuiLinearProgress-bar': { background: color } }} />
          </Box>

          <Box sx={{ mt:2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ width: 140, height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={34} outerRadius={52} paddingAngle={4}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>Contribution breakdown</Typography>
              {Object.keys(scores).map((k)=> (
                <Box key={k} sx={{ display:'flex', justifyContent:'space-between', gap:2, mt:1 }}>
                  <Typography sx={{ textTransform: 'uppercase', opacity: 0.85 }}>{k}</Typography>
                  <Typography sx={{ opacity: 0.9 }}>{Math.round((scores[k]||0)*100)}% × {(normalized[k]*100).toFixed(0)}%</Typography>
                </Box>
              ))}

              <Box sx={{ mt:2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Action</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>{recommendation}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  )
}
