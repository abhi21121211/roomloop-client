import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";

interface RoomEndAlertProps {
  open: boolean;
  roomTitle: string;
  redirectCountdown: number;
}

const RoomEndAlert: React.FC<RoomEndAlertProps> = ({
  open,
  roomTitle,
  redirectCountdown,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.9)
              : alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(4px)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: theme.palette.error.main,
          },
        },
      }}
    >
      <DialogContent sx={{ p: 4, textAlign: "center" }}>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <CircularProgress
            variant="determinate"
            value={(redirectCountdown / 5) * 100}
            size={80}
            thickness={4}
            sx={{
              color: theme.palette.error.main,
              opacity: 0.7,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: "bold", color: theme.palette.error.main }}
            >
              {redirectCountdown}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <AccessTimeIcon fontSize="large" color="error" />
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: theme.palette.error.main,
            }}
          >
            This room has ended
          </Typography>
          <Typography
            variant="body1"
            color="text.primary"
            paragraph
            sx={{
              fontSize: "1.05rem",
              fontWeight: 500,
              backgroundColor: alpha(theme.palette.error.main, 0.08),
              p: 2,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            "{roomTitle}" has concluded. You will be redirected to the dashboard
            in {redirectCountdown} seconds.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RoomEndAlert;
