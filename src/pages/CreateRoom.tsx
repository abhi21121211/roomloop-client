import React, { useState } from "react";
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
} from "@mui/material";
// Temporarily comment out date picker imports
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { useRoom } from "../contexts/RoomContext";
import { CreateRoomFormData, RoomType } from "../types";

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

const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom } = useRoom();

  const [roomData, setRoomData] = useState<CreateRoomFormData>({
    title: "",
    description: "",
    roomType: RoomType.PUBLIC,
    startTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
    endTime: new Date(Date.now() + 90 * 60000), // 90 minutes from now
    maxParticipants: 10,
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Modified to handle string input for date/time
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateTimeStr = e.target.value;
    if (newDateTimeStr) {
      const newDate = new Date(newDateTimeStr);
      setRoomData((prev) => ({ ...prev, startTime: newDate }));
    }
  };

  // Modified to handle string input for date/time
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateTimeStr = e.target.value;
    if (newDateTimeStr) {
      const newDate = new Date(newDateTimeStr);
      setRoomData((prev) => ({ ...prev, endTime: newDate }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    return date.toISOString().slice(0, 16);
  };

  return (
    // Removed LocalizationProvider
    <Grid container justifyContent="center">
      <Grid item xs={12} md={8} lg={6}>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create a New Room
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Room Title"
              name="title"
              autoFocus
              value={roomData.title}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={4}
              value={roomData.description}
              onChange={handleChange}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="roomType-label">Room Type</InputLabel>
              <Select
                labelId="roomType-label"
                id="roomType"
                value={roomData.roomType}
                label="Room Type"
                onChange={handleRoomTypeChange}
              >
                <MenuItem value={RoomType.PUBLIC}>Public</MenuItem>
                <MenuItem value={RoomType.PRIVATE}>
                  Private (Invite Only)
                </MenuItem>
              </Select>
            </FormControl>

            {/* Replace DateTimePicker with TextField */}
            <TextField
              margin="normal"
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
            />

            {/* Replace DateTimePicker with TextField */}
            <TextField
              margin="normal"
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
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="maxParticipants"
              label="Max Participants"
              name="maxParticipants"
              type="number"
              InputProps={{ inputProps: { min: 1, max: 100 } }}
              value={roomData.maxParticipants}
              onChange={handleCapacityChange}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="tags-label">Tags</InputLabel>
              <Select
                labelId="tags-label"
                id="tags"
                multiple
                value={roomData.tags}
                onChange={handleTagChange}
                input={<OutlinedInput id="select-multiple-chip" label="Tags" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Room"}
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CreateRoom;
