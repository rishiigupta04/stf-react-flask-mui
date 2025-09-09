import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Divider, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function SimilarityExplainModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        Similarity Analysis Explained
        <IconButton onClick={onClose} size="small" sx={{ ml: 2 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          How is Similarity Calculated?
        </Typography>
        <Typography variant="body2" paragraph>
          The similarity score compares the submitted website screenshot against known brand reference images using multiple features:
        </Typography>
        <ul style={{ marginTop: 0 }}>
          <li>
            <b>Image Similarity:</b> Measures how visually similar the screenshots are using advanced image comparison algorithms.
          </li>
          <li>
            <b>Color Similarity:</b> Compares the dominant color schemes and palettes between the two images.
          </li>
          <li>
            <b>Text Similarity:</b> Analyzes the extracted text content and its similarity to the brand reference.
          </li>
        </ul>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          What Do the Levels Mean?
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2"><b>Legit (≥ 90%)</b>: Very high similarity. This is likely the original brand website.</Typography>
          <Typography variant="body2"><b>High (65% - 89%)</b>: High resemblance. The site may be impersonating a brand.</Typography>
          <Typography variant="body2"><b>Moderate (35% - 64%)</b>: Some resemblance. Partial match detected.</Typography>
          <Typography variant="body2"><b>Low (&lt; 35%)</b>: Low resemblance. Unlikely to be impersonation.</Typography>
        </Box>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          How Should I Interpret the Results?
        </Typography>
        <Typography variant="body2" paragraph>
          - A <b>Legit</b> result means the site is almost certainly the real brand.<br />
          - <b>High</b> similarity may indicate a phishing attempt if you did not expect to see the brand.<br />
          - <b>Moderate</b> or <b>Low</b> similarity usually means the site is not closely related to the brand.
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          FAQ & Tips
        </Typography>
        <Typography variant="body2">
          • If you are unsure, always verify the website URL and look for other signs of phishing.<br />
          • No automated system is perfect—use this tool as one part of your decision process.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

