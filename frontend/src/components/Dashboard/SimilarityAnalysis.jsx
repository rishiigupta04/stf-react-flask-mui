import React, { useState } from 'react'
import {
  Paper, Typography, Box, LinearProgress, Grid, Chip, Stack,
  Dialog, DialogContent, IconButton, Divider
} from '@mui/material'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import CloseIcon from '@mui/icons-material/Close'
import { motion } from 'framer-motion'

export default function SimilarityAnalysis({ simResult, simLoading, simError }) {
  const [openImg, setOpenImg] = useState(false)
  const [imgSrc, setImgSrc] = useState('')
  const [imgCaption, setImgCaption] = useState('')

  const openImage = (src, caption) => {
    setImgSrc(src)
    setImgCaption(caption)
    setOpenImg(true)
  }

  const closeImage = () => setOpenImg(false)

  const result = simResult?.result ?? simResult
  const score = result?.score ?? null
  const details = result?.details ?? {}

  const level = score == null ? null : score >= 0.65 ? 'High' : score >= 0.35 ? 'Moderate' : 'Low'
  const levelColor = level === 'High' ? 'error' : level === 'Moderate' ? 'warning' : 'success'

  const refSrc = result?.reference_image ? `http://localhost:5000/static/brands/${result.reference_image.split(/[/\\]/).pop()}` : null
  const userSrc = result?.user_screenshot ? `http://localhost:5000/static/user/${result.user_screenshot.split(/[/\\]/).pop()}` : null

  return (
    <Paper
      sx={{
        p: 2.25,
        /* match other dashboard cards: use paper background so this card blends with the rest */
        background: theme => theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme => theme.palette.mode === 'dark' ? '0 6px 18px rgba(2,6,23,0.55)' : '0 4px 10px rgba(2,6,23,0.06)',
        fontFamily: 'Inter, sans-serif'
      }}
      elevation={0}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Website Similarity Analysis
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.65 }}>
            Comparing submitted screenshot against known brand assets
          </Typography>
        </Box>
        <Chip
          icon={<CompareArrowsIcon />}
          label={level || 'No Data'}
          sx={{
            background: level === 'High'
              ? 'linear-gradient(90deg,#ff4d4d,#d32f2f)' :
              level === 'Moderate'
              ? 'linear-gradient(90deg,#ffb74d,#f57c00)' :
              'linear-gradient(90deg,#4db6ac,#00796b)',
            color: '#fff',
            fontWeight: 600
          }}
        />
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />

      {/* Content */}
      <Box sx={{ mt: 2 }}>
        {simLoading && <Typography>Checking similarity...</Typography>}
        {simError && <Typography color="error">{String(simError)}</Typography>}

        {score !== null && (
          <Box>
            {/* Overall score */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#4db6ac' }}>
                  {Math.round(score*100)}%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  Overall similarity
                </Typography>
              </motion.div>

              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={score*100}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.05)',
                    '& .MuiLinearProgress-bar': {
                      background: score >= 0.65 ? '#e57373' : score >= 0.35 ? '#ffb74d' : '#4db6ac'
                    }
                  }}
                />
                <Typography variant="body2" sx={{ mt:1, opacity: 0.85 }}>
                  {level === 'High' && '⚠️ High resemblance — may be impersonating a brand.'}
                  {level === 'Moderate' && '🔶 Moderate resemblance — partial match detected.'}
                  {level === 'Low' && '✅ Low resemblance — unlikely to be impersonation.'}
                </Typography>
              </Box>
            </Box>

            {/* Breakdown */}
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
              Similarity Breakdown
            </Typography>
            <Grid container spacing={2}>
              {['image','color','text'].map((k)=> (
                <Grid item xs={12} sm={4} key={k}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      /* transparent so it visually matches the parent card */
                      bgcolor: 'transparent',
                      textAlign: 'center'
                    }}
                     elevation={0}
                     component={motion.div}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                   >
                     <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 700 }}>
                       {k}
                     </Typography>
                     <Typography variant="h6" sx={{ mt: 0.5 }}>
                       {((details[k] ?? 0)*100).toFixed(1)}%
                     </Typography>
                     <LinearProgress
                       variant="determinate"
                       value={(details[k] ?? 0)*100}
                       sx={{
                         height: 8,
                         borderRadius: 6,
                         mt:1,
                         background: 'rgba(255,255,255,0.04)',
                         '& .MuiLinearProgress-bar': { background: '#1976d2' }
                       }}
                     />
                   </Paper>
                 </Grid>
               ))}
             </Grid>

             {/* Screenshots */}
             <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
               Screenshots Comparison
             </Typography>
             <Stack direction="row" spacing={3} sx={{ mt: 1, flexWrap: 'wrap' }}>
               {refSrc && (
                 <motion.div whileHover={{ scale: 1.03 }}>
                   <Box sx={{ textAlign: 'center' }}>
                     <img
                       src={refSrc}
                       alt="ref"
                       onClick={() => openImage(refSrc, 'Reference')}

                  style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 12, boxShadow: 'none', cursor: 'pointer' }}
                     />
                     <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.78 }}>
                       Reference Brand
                     </Typography>
                   </Box>
                 </motion.div>
               )}
               {userSrc && (
                 <motion.div whileHover={{ scale: 1.03 }}>
                   <Box sx={{ textAlign: 'center' }}>
                     <img
                       src={userSrc}
                       alt="user"
                       onClick={() => openImage(userSrc, 'User Screenshot')}
                     style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 12, boxShadow: '0 12px 32px rgba(2,6,23,0.5)', cursor: 'pointer' }}
                    style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 12, boxShadow: 'none', cursor: 'pointer' }}
                     />
                     <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.78 }}>
                       Submitted Page
                     </Typography>
                   </Box>
                 </motion.div>
               )}
             </Stack>
          </Box>
        )}

        {!simLoading && score === null && !simError && (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            No similarity analysis available. Click Analyze to run checks.
          </Typography>
        )}
      </Box>

      {/* Lightbox */}
      <Dialog open={openImg} onClose={closeImage} maxWidth="lg" fullWidth>
        <DialogContent
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            backdropFilter: 'blur(8px)',
            background: 'rgba(0,0,0,0.85)'
          }}
        >
          <IconButton onClick={closeImage} sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}>
            <CloseIcon />
          </IconButton>
          {imgSrc && (
            <motion.img
              src={imgSrc}
              alt={imgCaption}
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  )
}
