import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  alpha,
  useTheme as useMuiTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../contexts/RoomContext";
import { RoomType } from "../types";
import ErrorMessage from "../components/common/ErrorMessage";
import StyledCard from "../components/common/StyledCard";
import StyledTextField from "../components/common/StyledTextField";
import StyledButton from "../components/common/StyledButton";

const CreateRoom: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    roomType: RoomType.PUBLIC,
    startTime: "",
    endTime: "",
    tags: [] as string[],
  });
  const [formErrors, setFormErrors] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [tagInput, setTagInput] = useState("");
  const { createRoom, loading, error } = useRoom();
  const navigate = useNavigate();
  const theme = useMuiTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, roomType: e.target.value as RoomType });
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      valid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      valid = false;
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
      valid = false;
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
      valid = false;
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (start >= end) {
        newErrors.endTime = "End time must be after start time";
        valid = false;
      }
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Convert string dates to Date objects
      const roomData = {
        ...formData,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
      };

      await createRoom(roomData);
      navigate("/dashboard");
    } catch (error) {
      // Error is handled by the room context
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 2,
      }}
    >
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <StyledCard
            sx={{
              width: "100%",
              background: `linear-gradient(145deg, ${
                theme.palette.background.paper
              } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
              backdropFilter: "blur(10px)",
              p: 4,
            }}
          >
            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                textAlign: "center",
                mb: 3,
              }}
            >
              🎉 Create New Room
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, textAlign: "center" }}
            >
              Set up your virtual event and start connecting with people
            </Typography>

            <ErrorMessage message={error} />

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledTextField
                    required
                    fullWidth
                    label="Room Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={!!formErrors.title}
                    helperText={formErrors.title}
                    placeholder="Enter an engaging title for your room..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <StyledTextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={!!formErrors.description}
                    helperText={formErrors.description}
                    placeholder="Describe what your room is about..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Room Type</InputLabel>
                    <Select
                      value={formData.roomType}
                      label="Room Type"
                      onChange={handleSelectChange}
                      sx={{
                        borderRadius: 3,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha(theme.palette.primary.main, 0.4),
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <MenuItem value={RoomType.PUBLIC}>🌍 Public</MenuItem>
                      <MenuItem value={RoomType.PRIVATE}>🔒 Private</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    required
                    fullWidth
                    label="Start Time"
                    name="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={handleChange}
                    error={!!formErrors.startTime}
                    helperText={formErrors.startTime}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    required
                    fullWidth
                    label="End Time"
                    name="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={handleChange}
                    error={!!formErrors.endTime}
                    helperText={formErrors.endTime}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Add Tags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    placeholder="Type a tag and press Enter..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <Button
                          onClick={handleAddTag}
                          disabled={!tagInput.trim()}
                          sx={{
                            minWidth: "auto",
                            px: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            color: "white",
                            "&:hover": {
                              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                            },
                          }}
                        >
                          Add
                        </Button>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {formData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        sx={{
                          background: `linear-gradient(135deg, ${alpha(
                            theme.palette.primary.main,
                            0.1
                          )} 0%, ${alpha(
                            theme.palette.secondary.main,
                            0.1
                          )} 100%)`,
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                          "& .MuiChip-deleteIcon": {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                }}
              >
                <StyledButton
                  type="button"
                  variant="outlined"
                  onClick={() => navigate("/dashboard")}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    borderWidth: 2,
                  }}
                >
                  Cancel
                </StyledButton>
                <StyledButton
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  {loading ? "Creating..." : "🚀 Create Room"}
                </StyledButton>
              </Box>
            </Box>
          </StyledCard>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateRoom;
