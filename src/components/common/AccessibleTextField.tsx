import React, { forwardRef } from "react";
import {
  TextField,
  TextFieldProps,
  styled,
  InputAdornment,
  FormHelperText,
  Box,
} from "@mui/material";
import { useTheme } from "../../contexts/ThemeContext";

// Enhanced styled text field with accessibility features
const AccessibleTextFieldRoot = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    fontSize: "1rem",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.02)",

    // Focus styles for keyboard navigation
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: "2px",
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
      },
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.04)",
    },

    // Hover effects
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.04)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.light,
      },
    },

    // Error state
    "&.Mui-error": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.error.main,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.error.main,
        boxShadow: `0 0 0 4px ${theme.palette.error.main}20`,
      },
    },

    // Success state
    "&.Mui-success": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.success.main,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.success.main,
        boxShadow: `0 0 0 4px ${theme.palette.success.main}20`,
      },
    },
  },

  // Label styles
  "& .MuiInputLabel-root": {
    fontSize: "0.95rem",
    fontWeight: 500,
    color:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.7)"
        : "rgba(0,0,0,0.6)",

    "&.Mui-focused": {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },

    "&.Mui-error": {
      color: theme.palette.error.main,
    },
  },

  // Input styles
  "& .MuiInputBase-input": {
    padding: "16px 20px",
    fontSize: "1rem",
    lineHeight: 1.5,

    "&::placeholder": {
      color:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.5)"
          : "rgba(0,0,0,0.4)",
      opacity: 1,
    },
  },

  // Helper text styles
  "& .MuiFormHelperText-root": {
    fontSize: "0.875rem",
    marginTop: "4px",
    marginLeft: "4px",

    "&.Mui-error": {
      color: theme.palette.error.main,
    },

    "&.Mui-success": {
      color: theme.palette.success.main,
    },
  },

  // Character counter styles
  "& .MuiInputBase-inputAdornedEnd": {
    paddingRight: "60px",
  },
}));

// Enhanced text field props interface
interface AccessibleTextFieldProps extends Omit<TextFieldProps, "aria-label"> {
  ariaLabel?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
}

const AccessibleTextField = forwardRef<
  HTMLDivElement,
  AccessibleTextFieldProps
>(
  (
    {
      ariaLabel,
      helperText,
      errorText,
      successText,
      showCharacterCount = false,
      maxLength,
      startIcon,
      endIcon,
      loading = false,
      disabled,
      error,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const { actualTheme } = useTheme();

    // Generate default aria-label if not provided
    const defaultAriaLabel = props.label || props.placeholder || "Text input";
    const finalAriaLabel = ariaLabel || defaultAriaLabel;

    // Handle loading state
    const isDisabled = disabled || loading;

    // Character count
    const currentLength = typeof value === "string" ? value.length : 0;
    const showCount = showCharacterCount && maxLength;

    // Determine field state
    const hasError = error || !!errorText;
    const hasSuccess = !!successText;

    // Helper text priority: error > success > helper
    const displayHelperText = errorText || successText || helperText;

    // Input adornments
    const inputProps = {
      ...props.InputProps,
      startAdornment: startIcon ? (
        <InputAdornment position="start">{startIcon}</InputAdornment>
      ) : (
        props.InputProps?.startAdornment
      ),
      endAdornment: (
        <>
          {endIcon && <InputAdornment position="end">{endIcon}</InputAdornment>}
          {showCount && (
            <InputAdornment position="end">
              <Box
                component="span"
                sx={{
                  fontSize: "0.75rem",
                  color:
                    currentLength > maxLength * 0.9
                      ? "error.main"
                      : "text.secondary",
                  fontWeight: 500,
                  minWidth: "40px",
                  textAlign: "right",
                }}
                aria-label={`${currentLength} of ${maxLength} characters`}
              >
                {currentLength}/{maxLength}
              </Box>
            </InputAdornment>
          )}
        </>
      ),
    };

    return (
      <Box sx={{ position: "relative", width: "100%" }}>
        <AccessibleTextFieldRoot
          ref={ref}
          {...props}
          disabled={isDisabled}
          error={hasError}
          value={value}
          onChange={onChange}
          inputProps={{
            ...props.inputProps,
            maxLength: maxLength,
            "aria-label": String(finalAriaLabel),
            "aria-invalid": hasError,
            "aria-describedby": displayHelperText
              ? `${finalAriaLabel}-helper-text`
              : undefined,
          }}
          InputProps={inputProps}
          FormHelperTextProps={{
            id: `${finalAriaLabel}-helper-text`,
            "aria-live": hasError ? "assertive" : "polite",
          }}
          // Enhanced keyboard navigation
          onKeyDown={(e) => {
            // Handle Enter key for form submission
            if (e.key === "Enter" && props.onKeyDown) {
              props.onKeyDown(e);
            }
          }}
          sx={{
            ...props.sx,
            "& .MuiOutlinedInput-root": {
              ...(hasSuccess && {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "success.main",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "success.main",
                  boxShadow: "0 0 0 4px rgba(76, 175, 80, 0.2)",
                },
              }),
            },
          }}
        />

        {/* Custom helper text with enhanced styling */}
        {displayHelperText && (
          <FormHelperText
            id={`${finalAriaLabel}-helper-text`}
            error={hasError}
            sx={{
              color: hasError
                ? "error.main"
                : hasSuccess
                ? "success.main"
                : "text.secondary",
              fontSize: "0.875rem",
              marginTop: "4px",
              marginLeft: "4px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {displayHelperText}
          </FormHelperText>
        )}
      </Box>
    );
  }
);

AccessibleTextField.displayName = "AccessibleTextField";

export default AccessibleTextField;
