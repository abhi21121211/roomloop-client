import React from "react";
import { TextField, TextFieldProps, styled } from "@mui/material";

// Create a styled TextField component
const StyledTextFieldRoot = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0.2)"
        : "rgba(255, 255, 255, 0.9)",
    transition: "all 0.3s ease",
    "& fieldset": {
      borderWidth: "1px",
      borderColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
      transition: "border-color 0.3s ease",
    },
    "&:hover fieldset": {
      borderColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.3)"
          : "rgba(0, 0, 0, 0.3)",
    },
    "&.Mui-focused fieldset": {
      borderWidth: "2px",
      borderColor: `${theme.palette.primary.main} !important`,
    },
  },
  "& .MuiInputLabel-outlined": {
    fontSize: "0.95rem",
    fontWeight: 500,
    transition: "color 0.3s ease",
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "14px 16px",
  },
}));

const StyledTextField: React.FC<TextFieldProps> = (props) => {
  return <StyledTextFieldRoot {...props} />;
};

export default StyledTextField;
