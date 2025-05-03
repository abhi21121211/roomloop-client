import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Define available theme modes
export type ThemeMode = "light" | "dark" | "system";

// Theme context interface
interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleColorMode: () => void;
  actualTheme: "light" | "dark";
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  mode: "system",
  setMode: () => {},
  toggleColorMode: () => {},
  actualTheme: "light",
});

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Get saved theme from localStorage or use system as default
  const savedTheme = localStorage.getItem("theme-mode") as ThemeMode;
  const [mode, setMode] = useState<ThemeMode>(savedTheme || "system");

  // Determine if the system prefers dark mode
  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  // Calculate the actual theme based on mode and system preference
  const actualTheme =
    mode === "system" ? (prefersDarkMode ? "dark" : "light") : mode;

  // Define light theme
  const lightTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#3f51b5",
        light: "#7986cb",
        dark: "#303f9f",
      },
      secondary: {
        main: "#f50057",
        light: "#ff4081",
        dark: "#c51162",
      },
      background: {
        default: "#f5f5f5",
        paper: "#ffffff",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });

  // Define dark theme
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#7986cb",
        light: "#9fa8da",
        dark: "#5c6bc0",
      },
      secondary: {
        main: "#ff4081",
        light: "#ff80ab",
        dark: "#f50057",
      },
      background: {
        default: "#121212",
        paper: "#1e1e1e",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });

  // Set theme in localStorage when mode changes
  useEffect(() => {
    localStorage.setItem("theme-mode", mode);
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (mode === "system") {
        // Force a re-render when system preference changes and we're using system mode
        setMode("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode]);

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setMode((prevMode) => {
      if (prevMode === "light") return "dark";
      if (prevMode === "dark") return "system";
      return "light";
    });
  };

  // Select the appropriate theme based on actual theme
  const theme = actualTheme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{ mode, setMode, toggleColorMode, actualTheme }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
