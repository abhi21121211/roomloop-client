import React from "react";
import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  useTheme,
  IconButton,
  Stack,
  Divider,
  useMediaQuery,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        py: 4,
        px: { xs: 2, sm: 3 },
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(18, 18, 18, 0.9)"
            : "rgba(245, 245, 245, 0.9)",
        backdropFilter: "blur(8px)",
        borderTop: `1px solid ${
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)"
        }`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={isMobile ? 3 : 4}>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h6"
              color="primary"
              gutterBottom
              fontWeight="bold"
            >
              RoomLoop
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The modern platform for virtual events, micro-meetups, and
              collaborative spaces.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" color="primary" aria-label="facebook">
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="twitter">
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="instagram">
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="linkedin">
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="github">
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography
              variant="h6"
              color="text.primary"
              gutterBottom
              fontWeight="bold"
            >
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link
                component={RouterLink}
                to="/dashboard"
                color="text.secondary"
                underline="hover"
              >
                Dashboard
              </Link>
              <Link
                component={RouterLink}
                to="/explore"
                color="text.secondary"
                underline="hover"
              >
                Explore Rooms
              </Link>
              <Link
                component={RouterLink}
                to="/create-room"
                color="text.secondary"
                underline="hover"
              >
                Create Room
              </Link>
              <Link
                component={RouterLink}
                to="/profile"
                color="text.secondary"
                underline="hover"
              >
                Profile
              </Link>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography
              variant="h6"
              color="text.primary"
              gutterBottom
              fontWeight="bold"
            >
              Support
            </Typography>
            <Stack spacing={1}>
              <Link href="#" color="text.secondary" underline="hover">
                Help Center
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                Privacy Policy
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                Terms of Service
              </Link>
              <Link href="#" color="text.secondary" underline="hover">
                Contact Us
              </Link>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "rgba(255, 255, 255, 0.1)" }} />

        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} RoomLoop. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
