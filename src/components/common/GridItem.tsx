import React from "react";
import { Grid } from "@mui/material";

// This is a wrapper component for Grid items to avoid type issues in MUI v5
interface GridItemProps {
  children: React.ReactNode;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  [key: string]: any; // Allow any other props
}

const GridItem: React.FC<GridItemProps> = ({ children, ...props }) => {
  return (
    <Grid item {...props}>
      {children}
    </Grid>
  );
};

export default GridItem;
