import React from "react";
import { Button, ButtonProps, styled } from "@mui/material";

// Create a styled Button component
const StyledButtonRoot = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: "10px 20px",
  textTransform: "none",
  fontWeight: 600,
  transition:
    "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 8px rgba(0,0,0,0.3)"
      : "0 4px 8px rgba(0,0,0,0.1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 8px 16px rgba(0,0,0,0.4)"
        : "0 8px 16px rgba(0,0,0,0.15)",
  },
  "&.MuiButton-contained": {
    backgroundImage:
      theme.palette.mode === "dark"
        ? "linear-gradient(45deg, #7986cb 30%, #5c6bc0 90%)"
        : "linear-gradient(45deg, #3f51b5 30%, #303f9f 90%)",
  },
  "&.MuiButton-outlined": {
    borderWidth: 2,
    "&:hover": {
      borderWidth: 2,
    },
  },
}));

const StyledButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <StyledButtonRoot {...props}>{children}</StyledButtonRoot>;
};

export default StyledButton;
