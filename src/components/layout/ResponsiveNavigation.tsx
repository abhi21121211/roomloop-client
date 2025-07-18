import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  useMediaQuery,
  useTheme as useMuiTheme,
  SwipeableDrawer,
  Fab,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Explore as ExploreIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import ThemeToggle from "../common/ThemeToggle";
import AccessibleButton from "../common/AccessibleButton";

// Navigation item interface
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  requiresAuth?: boolean;
}

// Navigation items
const navItems: NavItem[] = [
  {
    label: "Home",
    path: "/",
    icon: <HomeIcon />,
  },
  {
    label: "Explore",
    path: "/explore",
    icon: <ExploreIcon />,
  },
  {
    label: "Create Room",
    path: "/create-room",
    icon: <AddIcon />,
    requiresAuth: true,
  },
];

const ResponsiveNavigation: React.FC = () => {
  const { actualTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();

  // Responsive breakpoints
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down("lg"));

  // State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation handlers
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate("/login");
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter navigation items based on auth
  const filteredNavItems = navItems.filter(
    (item) => !item.requiresAuth || user
  );

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mobile drawer content
  const renderMobileDrawer = () => (
    <SwipeableDrawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      onOpen={() => setDrawerOpen(true)}
      sx={{
        "& .MuiDrawer-paper": {
          width: 320,
          background: `linear-gradient(145deg, ${
            muiTheme.palette.background.paper
          } 0%, ${alpha(muiTheme.palette.primary.main, 0.02)} 100%)`,
          borderRight: `1px solid ${alpha(muiTheme.palette.primary.main, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(muiTheme.palette.common.black, 0.1)}`,
          backdropFilter: "blur(10px)",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            p: 2,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(
              muiTheme.palette.primary.main,
              0.1
            )} 0%, ${alpha(muiTheme.palette.secondary.main, 0.1)} 100%)`,
            border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🚀 RoomLoop
          </Typography>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                muiTheme.palette.primary.main,
                0.1
              )} 0%, ${alpha(muiTheme.palette.secondary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`,
              "&:hover": {
                background: `linear-gradient(135deg, ${alpha(
                  muiTheme.palette.primary.main,
                  0.2
                )} 0%, ${alpha(muiTheme.palette.secondary.main, 0.2)} 100%)`,
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider
          sx={{ mb: 3, borderColor: alpha(muiTheme.palette.primary.main, 0.2) }}
        />

        {/* User info */}
        {user && (
          <Box
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(
                muiTheme.palette.primary.main,
                0.1
              )} 0%, ${alpha(muiTheme.palette.secondary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`,
              boxShadow: `0 4px 20px ${alpha(
                muiTheme.palette.common.black,
                0.08
              )}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={user.avatar}
                alt={user.username}
                sx={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  boxShadow: `0 4px 12px ${alpha(
                    muiTheme.palette.primary.main,
                    0.3
                  )}`,
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {user.username}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.9rem" }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Navigation items */}
        <List sx={{ p: 0 }}>
          {filteredNavItems.map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 3,
                mb: 1.5,
                p: 2,
                transition: "all 0.3s ease",
                background:
                  location.pathname === item.path
                    ? `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`
                    : `linear-gradient(145deg, ${alpha(
                        muiTheme.palette.background.paper,
                        0.8
                      )} 0%, ${alpha(
                        muiTheme.palette.primary.main,
                        0.05
                      )} 100%)`,
                border:
                  location.pathname === item.path
                    ? "none"
                    : `1px solid ${alpha(muiTheme.palette.primary.main, 0.1)}`,
                boxShadow:
                  location.pathname === item.path
                    ? `0 4px 12px ${alpha(muiTheme.palette.primary.main, 0.3)}`
                    : `0 2px 8px ${alpha(muiTheme.palette.common.black, 0.05)}`,
                "&:hover": {
                  transform: "translateX(4px)",
                  boxShadow:
                    location.pathname === item.path
                      ? `0 6px 16px ${alpha(
                          muiTheme.palette.primary.main,
                          0.4
                        )}`
                      : `0 4px 12px ${alpha(
                          muiTheme.palette.common.black,
                          0.1
                        )}`,
                },
                "&.Mui-selected": {
                  color: "white",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark} 0%, ${muiTheme.palette.secondary.dark} 100%)`,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? "white"
                      : muiTheme.palette.primary.main,
                  mr: 2,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 700 : 600,
                  fontSize: "1rem",
                }}
              />
              {item.badge && (
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      background: `linear-gradient(135deg, ${muiTheme.palette.error.main} 0%, ${muiTheme.palette.error.dark} 100%)`,
                      boxShadow: `0 2px 8px ${alpha(
                        muiTheme.palette.error.main,
                        0.3
                      )}`,
                    },
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>

        <Divider
          sx={{ my: 3, borderColor: alpha(muiTheme.palette.primary.main, 0.2) }}
        />

        {/* Theme toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(
              muiTheme.palette.primary.main,
              0.05
            )} 0%, ${alpha(muiTheme.palette.secondary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: muiTheme.palette.primary.main }}
          >
            🌙 Theme
          </Typography>
          <ThemeToggle />
        </Box>

        {/* User menu items */}
        {user && (
          <>
            <Divider
              sx={{
                my: 3,
                borderColor: alpha(muiTheme.palette.primary.main, 0.2),
              }}
            />
            <List sx={{ p: 0 }}>
              <ListItem
                button
                onClick={() => {
                  handleNavigation("/profile");
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  mb: 1.5,
                  p: 2,
                  transition: "all 0.3s ease",
                  background: `linear-gradient(145deg, ${alpha(
                    muiTheme.palette.background.paper,
                    0.8
                  )} 0%, ${alpha(muiTheme.palette.primary.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(
                    muiTheme.palette.primary.main,
                    0.1
                  )}`,
                  "&:hover": {
                    transform: "translateX(4px)",
                    background: `linear-gradient(145deg, ${alpha(
                      muiTheme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(
                      muiTheme.palette.secondary.main,
                      0.1
                    )} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(
                      muiTheme.palette.common.black,
                      0.1
                    )}`,
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: muiTheme.palette.primary.main, mr: 2 }}
                >
                  <AccountIcon />
                </ListItemIcon>
                <ListItemText
                  primary="👤 Profile"
                  primaryTypographyProps={{ fontWeight: 600, fontSize: "1rem" }}
                />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  handleNavigation("/settings");
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  mb: 1.5,
                  p: 2,
                  transition: "all 0.3s ease",
                  background: `linear-gradient(145deg, ${alpha(
                    muiTheme.palette.background.paper,
                    0.8
                  )} 0%, ${alpha(muiTheme.palette.primary.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(
                    muiTheme.palette.primary.main,
                    0.1
                  )}`,
                  "&:hover": {
                    transform: "translateX(4px)",
                    background: `linear-gradient(145deg, ${alpha(
                      muiTheme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(
                      muiTheme.palette.secondary.main,
                      0.1
                    )} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(
                      muiTheme.palette.common.black,
                      0.1
                    )}`,
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: muiTheme.palette.primary.main, mr: 2 }}
                >
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="⚙️ Settings"
                  primaryTypographyProps={{ fontWeight: 600, fontSize: "1rem" }}
                />
              </ListItem>
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  borderRadius: 3,
                  p: 2,
                  transition: "all 0.3s ease",
                  background: `linear-gradient(145deg, ${alpha(
                    muiTheme.palette.error.main,
                    0.1
                  )} 0%, ${alpha(muiTheme.palette.error.light, 0.1)} 100%)`,
                  border: `1px solid ${alpha(
                    muiTheme.palette.error.main,
                    0.2
                  )}`,
                  "&:hover": {
                    transform: "translateX(4px)",
                    background: `linear-gradient(145deg, ${alpha(
                      muiTheme.palette.error.main,
                      0.2
                    )} 0%, ${alpha(muiTheme.palette.error.light, 0.2)} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(
                      muiTheme.palette.error.main,
                      0.2
                    )}`,
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: muiTheme.palette.error.main, mr: 2 }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="🚪 Logout"
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: muiTheme.palette.error.main,
                  }}
                />
              </ListItem>
            </List>
          </>
        )}
      </Box>
    </SwipeableDrawer>
  );

  // Desktop navigation
  const renderDesktopNavigation = () => (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: `linear-gradient(145deg, ${alpha(
          muiTheme.palette.background.paper,
          0.95
        )} 0%, ${alpha(muiTheme.palette.primary.main, 0.02)} 100%)`,
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${alpha(muiTheme.palette.primary.main, 0.1)}`,
        boxShadow: `0 4px 20px ${alpha(muiTheme.palette.common.black, 0.08)}`,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
            cursor: "pointer",
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mr: 4,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
          onClick={() => navigate("/")}
        >
          🚀 RoomLoop
        </Typography>

        {/* Desktop navigation items */}
        <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
          {filteredNavItems.map((item) => (
            <AccessibleButton
              key={item.path}
              variant={location.pathname === item.path ? "contained" : "text"}
              onClick={() => handleNavigation(item.path)}
              ariaLabel={`Navigate to ${item.label}`}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                minWidth: "auto",
              }}
            >
              {item.label}
            </AccessibleButton>
          ))}
        </Box>

        {/* Right side actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notifications */}
          {user && (
            <AccessibleButton
              variant="text"
              onClick={() => handleNavigation("/notifications")}
              ariaLabel="View notifications"
              sx={{ minWidth: "auto", p: 1 }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </AccessibleButton>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          {user ? (
            <>
              <IconButton
                onClick={handleUserMenuOpen}
                aria-label="User menu"
                sx={{ ml: 1 }}
              >
                <Avatar
                  src={user.avatar}
                  alt={user.username}
                  sx={{ width: 32, height: 32 }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleNavigation("/profile");
                    handleUserMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <AccountIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleNavigation("/settings");
                    handleUserMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <AccessibleButton
              variant="contained"
              onClick={() => navigate("/login")}
              ariaLabel="Login"
              sx={{ ml: 2 }}
            >
              Login
            </AccessibleButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );

  return (
    <>
      {/* Mobile hamburger menu */}
      {isMobile && (
        <IconButton
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1200,
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
            color: "white",
            boxShadow: `0 4px 12px ${alpha(
              muiTheme.palette.primary.main,
              0.3
            )}`,
            "&:hover": {
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark} 0%, ${muiTheme.palette.secondary.dark} 100%)`,
              transform: "scale(1.05)",
              boxShadow: `0 6px 16px ${alpha(
                muiTheme.palette.primary.main,
                0.4
              )}`,
            },
            transition: "all 0.3s ease",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Desktop navigation */}
      {!isMobile && renderDesktopNavigation()}

      {/* Mobile drawer */}
      {renderMobileDrawer()}

      {/* Scroll to top button */}
      {showScrollTop && (
        <Fab
          color="primary"
          aria-label="Scroll to top"
          onClick={handleScrollToTop}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
            color: "white",
            boxShadow: `0 6px 20px ${alpha(
              muiTheme.palette.primary.main,
              0.3
            )}`,
            "&:hover": {
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark} 0%, ${muiTheme.palette.secondary.dark} 100%)`,
              transform: "scale(1.1)",
              boxShadow: `0 8px 25px ${alpha(
                muiTheme.palette.primary.main,
                0.4
              )}`,
            },
            transition: "all 0.3s ease",
          }}
        >
          <ArrowUpIcon />
        </Fab>
      )}
    </>
  );
};

export default ResponsiveNavigation;
