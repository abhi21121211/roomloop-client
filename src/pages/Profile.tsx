import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  VpnKey as VpnKeyIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    "aria-controls": `profile-tabpanel-${index}`,
  };
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [value, setValue] = useState(0);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form data to user values when starting editing
      setFormData({
        ...formData,
        username: user?.username || "",
        email: user?.email || "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    // Username validation
    if (formData.username.trim() === "") {
      newErrors.username = "Username is required";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Valid email is required";
      isValid = false;
    }

    // Password validation
    if (value === 1) {
      // Only validate password fields when on the password tab
      if (formData.currentPassword === "") {
        newErrors.currentPassword = "Current password is required";
        isValid = false;
      }

      if (formData.newPassword === "") {
        newErrors.newPassword = "New password is required";
        isValid = false;
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
        isValid = false;
      }

      if (formData.confirmPassword !== formData.newPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // In a real app, you would update the user profile here
      console.log("Form submitted:", formData);
      setIsEditing(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Please login to view your profile
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                bgcolor: "primary.main",
                fontSize: "3rem",
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ mt: 2 }}>
              {user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Button
              variant={isEditing ? "outlined" : "contained"}
              sx={{ mt: 2 }}
              onClick={handleEditToggle}
            >
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </Button>
          </Grid>

          <Grid item xs={12} md={8}>
            <Tabs
              value={value}
              onChange={handleTabChange}
              aria-label="profile tabs"
            >
              <Tab label="Account Info" {...a11yProps(0)} />
              <Tab label="Password" {...a11yProps(1)} />
              <Tab label="Activity" {...a11yProps(2)} />
            </Tabs>

            <TabPanel value={value} index={0}>
              <Box component="form" noValidate onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.username}
                  helperText={errors.username}
                  InputProps={{
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
                {isEditing && (
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3 }}
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={value} index={1}>
              <Box component="form" noValidate onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword}
                  InputProps={{
                    startAdornment: (
                      <VpnKeyIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
                {isEditing && (
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3 }}
                    startIcon={<SaveIcon />}
                  >
                    Update Password
                  </Button>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={value} index={2}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Divider />
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Account Created"
                    secondary="May 3, 2025"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "secondary.main" }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Last Login" secondary="Today" />
                </ListItem>
              </List>
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
