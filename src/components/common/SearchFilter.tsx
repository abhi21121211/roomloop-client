import React, { useState, useCallback } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Collapse,
  Paper,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useTheme } from "../../contexts/ThemeContext";
import AccessibleButton from "./AccessibleButton";

// Filter types
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "multiselect" | "range" | "checkbox";
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
}

// Search and filter props interface
interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
  filterValues: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearAll?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  loading?: boolean;
  totalResults?: number;
  searchDebounceMs?: number;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  onClearAll,
  placeholder = "Search...",
  showFilters = false,
  onToggleFilters,
  loading = false,
  totalResults,
  searchDebounceMs = 300,
}) => {
  const { actualTheme } = useTheme();
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearchValue(value);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        onSearchChange(value);
      }, searchDebounceMs);

      setDebounceTimer(timer);
    },
    [onSearchChange, searchDebounceMs, debounceTimer]
  );

  // Clear search
  const handleClearSearch = () => {
    setLocalSearchValue("");
    onSearchChange("");
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    onFilterChange(key, value);
  };

  // Render filter based on type
  const renderFilter = (filter: FilterConfig) => {
    const value = filterValues[filter.key] || filter.defaultValue;

    switch (filter.type) {
      case "select":
        return (
          <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
            <InputLabel id={`filter-${filter.key}-label`}>
              {filter.label}
            </InputLabel>
            <Select
              labelId={`filter-${filter.key}-label`}
              value={value || ""}
              label={filter.label}
              onChange={(e: SelectChangeEvent) =>
                handleFilterChange(filter.key, e.target.value)
              }
              aria-label={`Filter by ${filter.label}`}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                  {option.count !== undefined && (
                    <Chip
                      label={option.count}
                      size="small"
                      sx={{ ml: 1, fontSize: "0.7rem" }}
                    />
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "multiselect":
        return (
          <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
            <InputLabel id={`filter-${filter.key}-label`}>
              {filter.label}
            </InputLabel>
            <Select
              labelId={`filter-${filter.key}-label`}
              multiple
              value={value || []}
              label={filter.label}
              onChange={(e: SelectChangeEvent<string[]>) =>
                handleFilterChange(filter.key, e.target.value)
              }
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const option = filter.options?.find(
                      (opt) => opt.value === value
                    );
                    return (
                      <Chip
                        key={value}
                        label={option?.label || value}
                        size="small"
                        sx={{ fontSize: "0.7rem" }}
                      />
                    );
                  })}
                </Box>
              )}
              aria-label={`Filter by ${filter.label}`}
            >
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox
                    checked={(value || []).indexOf(option.value) > -1}
                  />
                  {option.label}
                  {option.count !== undefined && (
                    <Chip
                      label={option.count}
                      size="small"
                      sx={{ ml: 1, fontSize: "0.7rem" }}
                    />
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "range":
        return (
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: "0.875rem" }}
            >
              {filter.label}
            </Typography>
            <Slider
              value={value || [filter.min || 0, filter.max || 100]}
              onChange={(_, newValue) =>
                handleFilterChange(filter.key, newValue)
              }
              valueLabelDisplay="auto"
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              aria-label={`${filter.label} range`}
              sx={{
                "& .MuiSlider-thumb": {
                  backgroundColor: "primary.main",
                },
                "& .MuiSlider-track": {
                  backgroundColor: "primary.main",
                },
                "& .MuiSlider-rail": {
                  backgroundColor:
                    actualTheme === "dark"
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.2)",
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">
                {value?.[0] || filter.min || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {value?.[1] || filter.max || 100}
              </Typography>
            </Box>
          </Box>
        );

      case "checkbox":
        return (
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: "0.875rem", fontWeight: 500 }}
            >
              {filter.label}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {filter.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={(value || []).includes(option.value)}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? [...(value || []), option.value]
                          : (value || []).filter(
                              (v: string) => v !== option.value
                            );
                        handleFilterChange(filter.key, newValue);
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>{option.label}</span>
                      {option.count !== undefined && (
                        <Chip
                          label={option.count}
                          size="small"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      )}
                    </Box>
                  }
                  sx={{ margin: 0 }}
                />
              ))}
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filterValues).some(
    (value) => value && (Array.isArray(value) ? value.length > 0 : value !== "")
  );

  return (
    <Box sx={{ width: "100%" }}>
      {/* Search bar */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={placeholder}
          value={localSearchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: localSearchValue && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor:
                actualTheme === "dark"
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.02)",
            },
          }}
        />

        {filters.length > 0 && (
          <Tooltip title={showFilters ? "Hide filters" : "Show filters"}>
            <AccessibleButton
              variant={showFilters ? "contained" : "outlined"}
              onClick={onToggleFilters}
              ariaLabel="Toggle filters"
              sx={{ minWidth: "auto", px: 2 }}
            >
              <FilterIcon />
            </AccessibleButton>
          </Tooltip>
        )}
      </Box>

      {/* Results count */}
      {totalResults !== undefined && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {totalResults} result{totalResults !== 1 ? "s" : ""}
          </Typography>
          {hasActiveFilters && (
            <>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="primary.main">
                Filtered
              </Typography>
            </>
          )}
        </Box>
      )}

      {/* Filters panel */}
      {filters.length > 0 && (
        <Collapse in={showFilters}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 2,
              border: `1px solid ${
                actualTheme === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.08)"
              }`,
              backgroundColor:
                actualTheme === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.01)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h3">
                Filters
              </Typography>
              {hasActiveFilters && onClearAll && (
                <AccessibleButton
                  variant="text"
                  onClick={onClearAll}
                  ariaLabel="Clear all filters"
                  size="small"
                >
                  Clear all
                </AccessibleButton>
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 3,
              }}
            >
              {filters.map((filter) => (
                <Box key={filter.key}>{renderFilter(filter)}</Box>
              ))}
            </Box>
          </Paper>
        </Collapse>
      )}

      {/* Active filters chips */}
      {hasActiveFilters && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {filters.map((filter) => {
            const value = filterValues[filter.key];
            if (!value || (Array.isArray(value) && value.length === 0))
              return null;

            const getFilterLabel = () => {
              if (Array.isArray(value)) {
                return value
                  .map((v) => {
                    const option = filter.options?.find(
                      (opt) => opt.value === v
                    );
                    return option?.label || v;
                  })
                  .join(", ");
              }
              const option = filter.options?.find((opt) => opt.value === value);
              return option?.label || value;
            };

            return (
              <Chip
                key={filter.key}
                label={`${filter.label}: ${getFilterLabel()}`}
                onDelete={() =>
                  handleFilterChange(filter.key, filter.defaultValue)
                }
                size="small"
                color="primary"
                variant="outlined"
                aria-label={`Remove ${filter.label} filter`}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default SearchFilter;
