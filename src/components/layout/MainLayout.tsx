import React from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Button,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Explore as ExploreIcon,
  AddCircle as AddCircleIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../common/ThemeToggle";
import NotificationBell from "../common/NotificationBell";
import Footer from "../common/Footer";

const drawerWidth = 240;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawer = (
    <div>
      <Toolbar
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.1
            )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          borderBottom: (theme) =>
            `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            fontWeight: 700,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          🚀 RoomLoop
        </Typography>
      </Toolbar>
      <Divider />
      <List
        sx={{
          background: (theme) =>
            `linear-gradient(145deg, ${
              theme.palette.background.paper
            } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          height: "100%",
          p: 2,
        }}
      >
        {isAuthenticated && (
          <>
            <ListItem
              component={Link}
              to="/dashboard"
              sx={{
                color: "inherit",
                textDecoration: "none",
                borderRadius: 3,
                mb: 1.5,
                p: 2,
                transition: "all 0.3s ease",
                background: (theme) =>
                  `linear-gradient(145deg, ${alpha(
                    theme.palette.background.paper,
                    0.8
                  )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: (theme) =>
                  `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
                "&:hover": {
                  transform: "translateX(4px)",
                  background: (theme) =>
                    `linear-gradient(145deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: (theme) => theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText
                primary="📊 Dashboard"
                primaryTypographyProps={{ fontWeight: 600, fontSize: "1rem" }}
              />
            </ListItem>
            <ListItem
              component={Link}
              to="/explore"
              sx={{
                color: "inherit",
                textDecoration: "none",
                borderRadius: 3,
                mb: 1.5,
                p: 2,
                transition: "all 0.3s ease",
                background: (theme) =>
                  `linear-gradient(145deg, ${alpha(
                    theme.palette.background.paper,
                    0.8
                  )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: (theme) =>
                  `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
                "&:hover": {
                  transform: "translateX(4px)",
                  background: (theme) =>
                    `linear-gradient(145deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: (theme) => theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <ExploreIcon />
              </ListItemIcon>
              <ListItemText
                primary="🔍 Explore Rooms"
                primaryTypographyProps={{ fontWeight: 600, fontSize: "1rem" }}
              />
            </ListItem>
            <ListItem
              component={Link}
              to="/create-room"
              sx={{
                color: "inherit",
                textDecoration: "none",
                borderRadius: 3,
                mb: 1.5,
                p: 2,
                transition: "all 0.3s ease",
                background: (theme) =>
                  `linear-gradient(145deg, ${alpha(
                    theme.palette.background.paper,
                    0.8
                  )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: (theme) =>
                  `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
                "&:hover": {
                  transform: "translateX(4px)",
                  background: (theme) =>
                    `linear-gradient(145deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: (theme) => theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <AddCircleIcon />
              </ListItemIcon>
              <ListItemText
                primary="➕ Create Room"
                primaryTypographyProps={{ fontWeight: 600, fontSize: "1rem" }}
              />
            </ListItem>
            <Divider
              sx={{
                my: 2,
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              }}
            />
            <ListItem
              component={Link}
              to="/profile"
              sx={{
                color: "inherit",
                textDecoration: "none",
                borderRadius: 3,
                mb: 1.5,
                p: 2,
                transition: "all 0.3s ease",
                background: (theme) =>
                  `linear-gradient(145deg, ${alpha(
                    theme.palette.background.paper,
                    0.8
                  )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: (theme) =>
                  `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
                "&:hover": {
                  transform: "translateX(4px)",
                  background: (theme) =>
                    `linear-gradient(145deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: (theme) => theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText
                primary="👤 Profile"
                primaryTypographyProps={{ fontWeight: 600, fontSize: "1rem" }}
              />
            </ListItem>
            <ListItem
              onClick={handleLogout}
              sx={{
                cursor: "pointer",
                borderRadius: 3,
                mb: 1.5,
                p: 2,
                transition: "all 0.3s ease",
                background: (theme) =>
                  `linear-gradient(145deg, ${alpha(
                    theme.palette.error.main,
                    0.1
                  )} 0%, ${alpha(theme.palette.error.light, 0.1)} 100%)`,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                boxShadow: (theme) =>
                  `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
                "&:hover": {
                  transform: "translateX(4px)",
                  background: (theme) =>
                    `linear-gradient(145deg, ${alpha(
                      theme.palette.error.main,
                      0.2
                    )} 0%, ${alpha(theme.palette.error.light, 0.2)} 100%)`,
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: (theme) => theme.palette.error.main,
                  mr: 2,
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="🚪 Logout"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: (theme) => theme.palette.error.main,
                }}
              />
            </ListItem>
          </>
        )}
        {!isAuthenticated && (
          <>
            <ListItem
              component={Link}
              to="/login"
              sx={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem
              component={Link}
              to="/register"
              sx={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backdropFilter: "blur(8px)",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(18, 18, 18, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 12px rgba(0,0,0,0.2)"
              : "0 4px 12px rgba(0,0,0,0.05)",
          color: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.common.white
              : theme.palette.common.black,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            RoomLoop - Drop-In Events & Micro-Meetups
          </Typography>
          <ThemeToggle />
          {isAuthenticated ? (
            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
              <NotificationBell />
              <Typography variant="body1" sx={{ mr: 2 }}>
                Hello, {user?.username}
              </Typography>
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 2,
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", ml: 2 }}>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  mx: 1,
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                Login
              </Button>
              <Button
                color="primary"
                variant="contained"
                component={Link}
                to="/register"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  },
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRadius: 0,
              borderRight: (theme) =>
                `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              background: (theme) =>
                `linear-gradient(145deg, ${
                  theme.palette.background.paper
                } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              boxShadow: (theme) =>
                `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
              backdropFilter: "blur(10px)",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRadius: 0,
              borderRight: (theme) =>
                `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              background: (theme) =>
                `linear-gradient(145deg, ${
                  theme.palette.background.paper
                } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              boxShadow: (theme) =>
                `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
              backdropFilter: "blur(10px)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(145deg, rgba(18,18,18,1) 0%, rgba(25,25,35,1) 100%)"
              : "linear-gradient(145deg, rgba(240,240,245,1) 0%, rgba(255,255,255,1) 100%)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ flexGrow: 1, mb: 4 }}>
          {children}
        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;
