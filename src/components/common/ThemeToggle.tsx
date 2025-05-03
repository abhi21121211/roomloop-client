import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import { useTheme, ThemeMode } from "../../contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { mode, toggleColorMode } = useTheme();

  // Return the appropriate icon based on the current mode
  const renderIcon = () => {
    switch (mode) {
      case "light":
        return <LightModeIcon />;
      case "dark":
        return <DarkModeIcon />;
      case "system":
        return <SettingsBrightnessIcon />;
      default:
        return <SettingsBrightnessIcon />;
    }
  };

  // Get tooltip text based on the current mode
  const getTooltipText = () => {
    switch (mode) {
      case "light":
        return "Switch to Dark Mode";
      case "dark":
        return "Switch to System Mode";
      case "system":
        return "Switch to Light Mode";
      default:
        return "Toggle Theme";
    }
  };

  return (
    <Tooltip title={getTooltipText()}>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        aria-label="toggle theme"
        sx={{
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "rotate(30deg)",
          },
        }}
      >
        {renderIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
