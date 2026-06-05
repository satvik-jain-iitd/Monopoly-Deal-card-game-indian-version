import { Box, Divider, Drawer, IconButton, List, ListItem, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function GameLog({ logs, onClose }) {
  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          pt: 'env(safe-area-inset-top)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
          Game Log
        </Typography>
        <IconButton size="small" onClick={onClose} edge="end">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <List dense sx={{ overflow: 'auto', flex: 1 }}>
        {[...logs].reverse().map((entry, i) => (
          <ListItem key={i} sx={{ py: 0.5, px: 2 }}>
            <Typography variant="caption" sx={{
              color: i === 0 ? 'primary.main' : 'text.secondary',
              fontWeight: i === 0 ? 600 : 400,
              lineHeight: 1.4,
            }}>
              {entry}
            </Typography>
          </ListItem>
        ))}
        {logs.length === 0 && (
          <ListItem>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Abhi koi action nahi hua
            </Typography>
          </ListItem>
        )}
      </List>
    </Drawer>
  )
}
