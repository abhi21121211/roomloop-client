import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
  Box,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Chip,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Close as CloseIcon,
  Accessibility as AccessibilityIcon,
  Visibility as VisibilityIcon,
  TextFields as TextFieldsIcon,
  Contrast as HighContrastIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from "@mui/icons-material";
import { useTheme } from "../../contexts/ThemeContext";
import AccessibleButton from "./AccessibleButton";

// Accessibility settings interface
interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: number;
  lineSpacing: number;
  reduceMotion: boolean;
  showFocusIndicators: boolean;
  screenReaderMode: boolean;
}

// Default settings
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 100, // percentage
  lineSpacing: 1.5,
  reduceMotion: false,
  showFocusIndicators: true,
  screenReaderMode: false,
};

// Accessibility settings props
interface AccessibilitySettingsProps {
  open: boolean;
  onClose: () => void;
  settings?: Partial<AccessibilitySettings>;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  open,
  onClose,
  settings: externalSettings,
  onSettingsChange,
}) => {
  const { actualTheme } = useTheme();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    ...defaultSettings,
    ...externalSettings,
  });

  // Apply settings to document
  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Apply font size
    root.style.fontSize = `${newSettings.fontSize}%`;

    // Apply line spacing
    root.style.lineHeight = newSettings.lineSpacing.toString();

    // Apply high contrast
    if (newSettings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Apply reduced motion
    if (newSettings.reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Apply focus indicators
    if (newSettings.showFocusIndicators) {
      root.classList.add("show-focus");
    } else {
      root.classList.remove("show-focus");
    }

    // Apply screen reader mode
    if (newSettings.screenReaderMode) {
      root.classList.add("screen-reader-mode");
    } else {
      root.classList.remove("screen-reader-mode");
    }
  };

  // Handle setting changes
  const handleSettingChange = (
    key: keyof AccessibilitySettings,
    value: any
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  // Reset to defaults
  const handleReset = () => {
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  };

  // Save settings to localStorage
  const handleSave = () => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
    onClose();
  };

  // Apply settings on mount
  React.useEffect(() => {
    applySettings(settings);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: actualTheme === "dark" ? "#1e1e1e" : "#ffffff",
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
          <AccessibilityIcon color="primary" />
          <Typography variant="h6" component="h2">
            Accessibility Settings
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="Close accessibility settings"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          These settings help make RoomLoop more accessible for users with
          different needs. Changes are applied immediately and saved to your
          browser.
        </Alert>

        {/* Visual Settings */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${
              actualTheme === "dark"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)"
            }`,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <VisibilityIcon />
            Visual Settings
          </Typography>

          {/* High Contrast Mode */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.highContrast}
                  onChange={(e) =>
                    handleSettingChange("highContrast", e.target.checked)
                  }
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HighContrastIcon fontSize="small" />
                  <Typography variant="body1">High Contrast Mode</Typography>
                  {settings.highContrast && (
                    <Chip label="Active" size="small" color="primary" />
                  )}
                </Box>
              }
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Increases contrast between text and background for better
              readability.
            </Typography>
          </Box>

          {/* Font Size */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body1"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <TextFieldsIcon fontSize="small" />
              Font Size: {settings.fontSize}%
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
              <ZoomOutIcon fontSize="small" color="action" />
              <Slider
                value={settings.fontSize}
                onChange={(_, value) => handleSettingChange("fontSize", value)}
                min={75}
                max={200}
                step={5}
                marks={[
                  { value: 75, label: "75%" },
                  { value: 100, label: "100%" },
                  { value: 150, label: "150%" },
                  { value: 200, label: "200%" },
                ]}
                aria-label="Font size adjustment"
                sx={{ flex: 1 }}
              />
              <ZoomInIcon fontSize="small" color="action" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Adjust the size of all text on the page.
            </Typography>
          </Box>

          {/* Line Spacing */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              Line Spacing: {settings.lineSpacing}x
            </Typography>
            <Slider
              value={settings.lineSpacing}
              onChange={(_, value) => handleSettingChange("lineSpacing", value)}
              min={1}
              max={3}
              step={0.1}
              marks={[
                { value: 1, label: "1x" },
                { value: 1.5, label: "1.5x" },
                { value: 2, label: "2x" },
                { value: 3, label: "3x" },
              ]}
              aria-label="Line spacing adjustment"
              sx={{ ml: 2, mr: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Adjust the spacing between lines of text.
            </Typography>
          </Box>

          {/* Focus Indicators */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showFocusIndicators}
                  onChange={(e) =>
                    handleSettingChange("showFocusIndicators", e.target.checked)
                  }
                  color="primary"
                />
              }
              label="Show Focus Indicators"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Always show focus indicators for keyboard navigation.
            </Typography>
          </Box>
        </Paper>

        {/* Motion Settings */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${
              actualTheme === "dark"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)"
            }`,
          }}
        >
          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
            Motion Settings
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.reduceMotion}
                onChange={(e) =>
                  handleSettingChange("reduceMotion", e.target.checked)
                }
                color="primary"
              />
            }
            label="Reduce Motion"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            Reduces animations and transitions for users sensitive to motion.
          </Typography>
        </Paper>

        {/* Screen Reader Settings */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${
              actualTheme === "dark"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)"
            }`,
          }}
        >
          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
            Screen Reader Settings
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.screenReaderMode}
                onChange={(e) =>
                  handleSettingChange("screenReaderMode", e.target.checked)
                }
                color="primary"
              />
            }
            label="Enhanced Screen Reader Support"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            Provides additional context and descriptions for screen readers.
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <AccessibleButton
          variant="outlined"
          onClick={handleReset}
          ariaLabel="Reset to default settings"
        >
          Reset to Defaults
        </AccessibleButton>
        <Box sx={{ flex: 1 }} />
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
          ariaLabel="Save accessibility settings"
        >
          Save Settings
        </AccessibleButton>
      </DialogActions>
    </Dialog>
  );
};

export default AccessibilitySettings;
