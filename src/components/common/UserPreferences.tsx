import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Accessibility as AccessibilityIcon,
  Language as LanguageIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import AccessibleButton from "./AccessibleButton";
import AccessibilitySettings from "./AccessibilitySettings";

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`preferences-tabpanel-${index}`}
    aria-labelledby={`preferences-tab-${index}`}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// User preferences interface
interface UserPreferences {
  // Profile settings
  displayName: string;
  bio: string;
  location: string;
  website: string;
  company: string;
  jobTitle: string;

  // Notification settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  roomInvitations: boolean;
  messageNotifications: boolean;
  marketingEmails: boolean;

  // Privacy settings
  profileVisibility: "public" | "private" | "friends";
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  showLastSeen: boolean;

  // Theme settings
  theme: "light" | "dark" | "system";
  accentColor: string;

  // Accessibility settings
  fontSize: number;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderMode: boolean;

  // Language settings
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
}

// Default preferences
const defaultPreferences: UserPreferences = {
  displayName: "",
  bio: "",
  location: "",
  website: "",
  company: "",
  jobTitle: "",
  emailNotifications: true,
  pushNotifications: true,
  roomInvitations: true,
  messageNotifications: true,
  marketingEmails: false,
  profileVisibility: "public",
  showOnlineStatus: true,
  allowDirectMessages: true,
  showLastSeen: true,
  theme: "system",
  accentColor: "#667eea",
  fontSize: 100,
  highContrast: false,
  reduceMotion: false,
  screenReaderMode: false,
  language: "en",
  timezone: "UTC",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
};

// User preferences props
interface UserPreferencesProps {
  open: boolean;
  onClose: () => void;
  onSave?: (preferences: UserPreferences) => Promise<void>;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const { actualTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    if (user) {
      const savedPreferences = localStorage.getItem(
        `user-preferences-${user.id}`
      );
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      } else {
        // Initialize with user data
        setPreferences({
          ...defaultPreferences,
          displayName: user.username || "",
          bio: user.bio || "",
        });
      }
    }
  }, [user]);

  // Handle preference change
  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    try {
      if (onSave) {
        await onSave(preferences);
      }
      // Save to localStorage
      if (user) {
        localStorage.setItem(
          `user-preferences-${user.id}`,
          JSON.stringify(preferences)
        );
      }
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: actualTheme === "dark" ? "#1e1e1e" : "#ffffff",
          height: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h6" component="h2">
            User Preferences
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {hasChanges && (
            <Chip label="Unsaved changes" color="warning" size="small" />
          )}
          <AccessibleButton
            variant="outlined"
            onClick={handleReset}
            ariaLabel="Reset to defaults"
            size="small"
          >
            Reset
          </AccessibleButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: "flex", height: "100%" }}>
          {/* Tabs */}
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderRight: `1px solid ${
                actualTheme === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.08)"
              }`,
              minWidth: 200,
            }}
          >
            <Tab
              icon={<SettingsIcon />}
              label="Profile"
              id="preferences-tab-0"
              aria-controls="preferences-tabpanel-0"
            />
            <Tab
              icon={<NotificationsIcon />}
              label="Notifications"
              id="preferences-tab-1"
              aria-controls="preferences-tabpanel-1"
            />
            <Tab
              icon={<SecurityIcon />}
              label="Privacy"
              id="preferences-tab-2"
              aria-controls="preferences-tabpanel-2"
            />
            <Tab
              icon={<PaletteIcon />}
              label="Appearance"
              id="preferences-tab-3"
              aria-controls="preferences-tabpanel-3"
            />
            <Tab
              icon={<AccessibilityIcon />}
              label="Accessibility"
              id="preferences-tab-4"
              aria-controls="preferences-tabpanel-4"
            />
            <Tab
              icon={<LanguageIcon />}
              label="Language"
              id="preferences-tab-5"
              aria-controls="preferences-tabpanel-5"
            />
          </Tabs>

          {/* Tab content */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {/* Profile Tab */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={preferences.displayName}
                    onChange={(e) =>
                      handlePreferenceChange("displayName", e.target.value)
                    }
                    helperText="This is how your name appears to other users"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={preferences.jobTitle}
                    onChange={(e) =>
                      handlePreferenceChange("jobTitle", e.target.value)
                    }
                    helperText="Your professional title"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={preferences.company}
                    onChange={(e) =>
                      handlePreferenceChange("company", e.target.value)
                    }
                    helperText="Your company or organization"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={preferences.location}
                    onChange={(e) =>
                      handlePreferenceChange("location", e.target.value)
                    }
                    helperText="Your city and country"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Bio"
                    value={preferences.bio}
                    onChange={(e) =>
                      handlePreferenceChange("bio", e.target.value)
                    }
                    helperText="Tell others about yourself"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={preferences.website}
                    onChange={(e) =>
                      handlePreferenceChange("website", e.target.value)
                    }
                    helperText="Your personal or professional website"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.emailNotifications}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive notifications in your browser"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.pushNotifications}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "pushNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WorkIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Room Invitations"
                    secondary="Get notified when invited to rooms"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.roomInvitations}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "roomInvitations",
                          e.target.checked
                        )
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ChatIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Message Notifications"
                    secondary="Get notified of new messages"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.messageNotifications}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "messageNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Marketing Emails"
                    secondary="Receive updates about new features"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.marketingEmails}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "marketingEmails",
                          e.target.checked
                        )
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </TabPanel>

            {/* Privacy Tab */}
            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6" gutterBottom>
                Privacy Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Profile Visibility</InputLabel>
                    <Select
                      value={preferences.profileVisibility}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "profileVisibility",
                          e.target.value
                        )
                      }
                      label="Profile Visibility"
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                      <MenuItem value="friends">Friends Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Show Online Status"
                        secondary="Let others see when you're online"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={preferences.showOnlineStatus}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "showOnlineStatus",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Allow Direct Messages"
                        secondary="Let other users send you direct messages"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={preferences.allowDirectMessages}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "allowDirectMessages",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Show Last Seen"
                        secondary="Show when you were last active"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={preferences.showLastSeen}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "showLastSeen",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Appearance Tab */}
            <TabPanel value={activeTab} index={3}>
              <Typography variant="h6" gutterBottom>
                Appearance Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={preferences.theme}
                      onChange={(e) =>
                        handlePreferenceChange("theme", e.target.value)
                      }
                      label="Theme"
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Accent Color"
                    type="color"
                    value={preferences.accentColor}
                    onChange={(e) =>
                      handlePreferenceChange("accentColor", e.target.value)
                    }
                    helperText="Choose your preferred accent color"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Accessibility Tab */}
            <TabPanel value={activeTab} index={4}>
              <Typography variant="h6" gutterBottom>
                Accessibility Settings
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                These settings help make RoomLoop more accessible for users with
                different needs.
              </Alert>
              <AccessibleButton
                variant="outlined"
                onClick={() => setAccessibilityOpen(true)}
                ariaLabel="Open detailed accessibility settings"
              >
                Open Accessibility Settings
              </AccessibleButton>
            </TabPanel>

            {/* Language Tab */}
            <TabPanel value={activeTab} index={5}>
              <Typography variant="h6" gutterBottom>
                Language & Region
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={preferences.language}
                      onChange={(e) =>
                        handlePreferenceChange("language", e.target.value)
                      }
                      label="Language"
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Español</MenuItem>
                      <MenuItem value="fr">Français</MenuItem>
                      <MenuItem value="de">Deutsch</MenuItem>
                      <MenuItem value="zh">中文</MenuItem>
                      <MenuItem value="ja">日本語</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={preferences.timezone}
                      onChange={(e) =>
                        handlePreferenceChange("timezone", e.target.value)
                      }
                      label="Timezone"
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Chicago">Central Time</MenuItem>
                      <MenuItem value="America/Denver">Mountain Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">
                        Pacific Time
                      </MenuItem>
                      <MenuItem value="Europe/London">London</MenuItem>
                      <MenuItem value="Europe/Paris">Paris</MenuItem>
                      <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={preferences.dateFormat}
                      onChange={(e) =>
                        handlePreferenceChange("dateFormat", e.target.value)
                      }
                      label="Date Format"
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Time Format</InputLabel>
                    <Select
                      value={preferences.timeFormat}
                      onChange={(e) =>
                        handlePreferenceChange("timeFormat", e.target.value)
                      }
                      label="Time Format"
                    >
                      <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                      <MenuItem value="24h">24-hour</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <AccessibleButton
          variant="outlined"
          onClick={onClose}
          ariaLabel="Cancel changes"
        >
          Cancel
        </AccessibleButton>
        <AccessibleButton
          variant="contained"
          onClick={handleSave}
          loading={loading}
          disabled={!hasChanges}
          ariaLabel="Save preferences"
        >
          Save Changes
        </AccessibleButton>
      </DialogActions>

      {/* Accessibility Settings Dialog */}
      <AccessibilitySettings
        open={accessibilityOpen}
        onClose={() => setAccessibilityOpen(false)}
        settings={{
          highContrast: preferences.highContrast,
          fontSize: preferences.fontSize,
          reduceMotion: preferences.reduceMotion,
          screenReaderMode: preferences.screenReaderMode,
        }}
        onSettingsChange={(settings) => {
          setPreferences((prev) => ({
            ...prev,
            ...settings,
          }));
          setHasChanges(true);
        }}
      />
    </Dialog>
  );
};

export default UserPreferences;
