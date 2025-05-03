import React, { ReactNode } from "react";
import { Card, CardContent, CardProps, styled } from "@mui/material";

// Create a styled Card component with custom styling
const StyledCardRoot = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 16px rgba(0,0,0,0.2)"
      : "0 8px 16px rgba(0,0,0,0.05)",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(30, 30, 30, 0.8)"
      : "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: `1px solid ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
  }`,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 16px 32px rgba(0,0,0,0.3)"
        : "0 16px 32px rgba(0,0,0,0.1)",
  },
}));

// Create a styled CardContent component
const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
}));

interface StyledCardProps extends CardProps {
  children: ReactNode;
}

const StyledCard: React.FC<StyledCardProps> = ({ children, ...props }) => {
  return (
    <StyledCardRoot {...props}>
      <StyledCardContent>{children}</StyledCardContent>
    </StyledCardRoot>
  );
};

export default StyledCard;
