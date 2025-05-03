import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Grid,
  useTheme as useMuiTheme,
  Stack,
} from "@mui/material";
// Temporarily comment out date picker imports
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { useRoom } from "../contexts/RoomContext";
import { CreateRoomFormData, RoomType } from "../types";
import StyledCard from "../components/common/StyledCard";
import StyledTextField from "../components/common/StyledTextField";
import StyledButton from "../components/common/StyledButton";

// Available tags for rooms
const availableTags = [
  "Technology",
  "Business",
  "Education",
  "Entertainment",
  "Gaming",
  "Health",
  "Music",
  "Science",
  "Sports",
  "Travel",
  "Art",
  "Food",
  "Politics",
  "Books",
  "Movies",
];

const CreateRoom = () => {
  const navigate = useNavigate();
  const { createRoom } = useRoom();
  const theme = useMuiTheme();

  // Set default start and end times (30 min and 90 min from now)
  const getDefaultStartTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now;
  };

  const getDefaultEndTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 90);
    return now;
  };

  const [roomData, setRoomData] = useState<CreateRoomFormData>({
    title: "",
    description: "",
    roomType: RoomType.PUBLIC,
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(),
    maxParticipants: 10,
    tags: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refresh default times when component mounts
  useEffect(() => {
    setRoomData((prev) => ({
      ...prev,
      startTime: getDefaultStartTime(),
      endTime: getDefaultEndTime(),
    }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setRoomData((prev) => ({
      ...prev,
      tags: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleRoomTypeChange = (event: SelectChangeEvent) => {
    setRoomData((prev) => ({
      ...prev,
      roomType: event.target.value as RoomType,
    }));
  };

  const handleCapacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maxParticipants = parseInt(event.target.value);
    if (!isNaN(maxParticipants) && maxParticipants > 0) {
      setRoomData((prev) => ({ ...prev, maxParticipants }));
    }
  };

  // Handle start time changes
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateTimeStr = e.target.value;
    if (newDateTimeStr) {
      try {
        const newDate = new Date(newDateTimeStr);

        // Validate the date is not in the past
        if (newDate.getTime() < new Date().getTime()) {
          setError("Start time cannot be in the past");
          return;
        }

        // Clear any previous errors
        if (error.includes("time")) {
          setError("");
        }

        setRoomData((prev) => ({
          ...prev,
          startTime: newDate,
          // If end time is before the new start time, adjust it
          endTime:
            prev.endTime < newDate
              ? new Date(newDate.getTime() + 60 * 60000)
              : prev.endTime,
        }));
      } catch (err) {
        setError("Invalid date format");
      }
    }
  };

  // Handle end time changes
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateTimeStr = e.target.value;
    if (newDateTimeStr) {
      try {
        const newDate = new Date(newDateTimeStr);

        // Validate the end time is after the start time
        if (newDate <= roomData.startTime) {
          setError("End time must be after start time");
          return;
        }

        // Clear any previous errors
        if (error.includes("time")) {
          setError("");
        }

        setRoomData((prev) => ({ ...prev, endTime: newDate }));
      } catch (err) {
        setError("Invalid date format");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!roomData.title.trim()) {
      setError("Room title is required");
      return;
    }

    if (!roomData.description.trim()) {
      setError("Description is required");
      return;
    }

    // Validate times again
    const now = new Date();
    if (roomData.startTime < now) {
      setError("Start time cannot be in the past");
      return;
    }

    if (roomData.endTime <= roomData.startTime) {
      setError("End time must be after start time");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createRoom(roomData);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format date for the datetime-local input
  const formatDateForInput = (date: Date): string => {
    // Format: YYYY-MM-DDThh:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} md={8} lg={6}>
        <StyledCard sx={{ p: 0, mt: 4 }}>
          <Box
            sx={{
              p: 3,
              borderBottom: `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)"
              }`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(18,18,18,0.8)"
                  : "rgba(245,245,245,0.5)",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{
                backgroundImage:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(45deg, #7986cb 30%, #5c6bc0 90%)"
                    : "linear-gradient(45deg, #3f51b5 30%, #303f9f 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Create a New Room
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            {error && (
              <Typography color="error" sx={{ mb: 2, fontWeight: 500 }}>
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <StyledTextField
                  required
                  fullWidth
                  id="title"
                  label="Room Title"
                  name="title"
                  autoFocus
                  value={roomData.title}
                  onChange={handleChange}
                  placeholder="Enter an engaging title for your room"
                />

                <StyledTextField
                  required
                  fullWidth
                  id="description"
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={roomData.description}
                  onChange={handleChange}
                  placeholder="Describe what this room is about and what participants can expect"
                />

                <FormControl fullWidth>
                  <InputLabel id="roomType-label">Room Type</InputLabel>
                  <Select
                    labelId="roomType-label"
                    id="roomType"
                    value={roomData.roomType}
                    label="Room Type"
                    onChange={handleRoomTypeChange}
                  >
                    <MenuItem value={RoomType.PUBLIC}>
                      Public (Anyone can join)
                    </MenuItem>
                    <MenuItem value={RoomType.PRIVATE}>
                      Private (Invite only)
                    </MenuItem>
                  </Select>
                </FormControl>

                <StyledTextField
                  required
                  fullWidth
                  id="startTime"
                  label="Start Time"
                  name="startTime"
                  type="datetime-local"
                  value={formatDateForInput(roomData.startTime)}
                  onChange={handleStartTimeChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="When will this room start"
                />

                <StyledTextField
                  required
                  fullWidth
                  id="endTime"
                  label="End Time"
                  name="endTime"
                  type="datetime-local"
                  value={formatDateForInput(roomData.endTime)}
                  onChange={handleEndTimeChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="When will this room end"
                />

                <StyledTextField
                  required
                  fullWidth
                  id="maxParticipants"
                  label="Max Participants"
                  name="maxParticipants"
                  type="number"
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                  value={roomData.maxParticipants}
                  onChange={handleCapacityChange}
                  helperText="How many people can join this room (max 100)"
                />

                <FormControl fullWidth>
                  <InputLabel id="tags-label">Tags</InputLabel>
                  <Select
                    labelId="tags-label"
                    id="tags"
                    multiple
                    value={roomData.tags}
                    onChange={handleTagChange}
                    input={
                      <OutlinedInput id="select-multiple-chip" label="Tags" />
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            sx={{
                              bgcolor: (alpha) => theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {availableTags.map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Room"}
                </StyledButton>
              </Stack>
            </Box>
          </Box>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default CreateRoom;
