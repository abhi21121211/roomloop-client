import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link as MuiLink,
  Stack,
  useTheme as useMuiTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ErrorMessage from "../components/common/ErrorMessage";
import StyledCard from "../components/common/StyledCard";
import StyledTextField from "../components/common/StyledTextField";
import StyledButton from "../components/common/StyledButton";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const theme = useMuiTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
    if (error) clearError();
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      valid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          mb: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <StyledCard sx={{ width: "100%" }}>
          <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
            <Typography
              component="h1"
              variant="h4"
              fontWeight="bold"
              color="primary"
              sx={{
                backgroundImage:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(45deg, #7986cb 30%, #5c6bc0 90%)"
                    : "linear-gradient(45deg, #3f51b5 30%, #303f9f 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                mb: 1,
              }}
            >
              Create a RoomLoop Account
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Fill in the details to join our community
            </Typography>

            <ErrorMessage message={error} />

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </StyledButton>
              <Grid container justifyContent="center">
                <Grid item>
                  <MuiLink
                    component={Link}
                    to="/login"
                    variant="body2"
                    sx={{
                      textDecoration: "none",
                      fontWeight: "medium",
                      transition: "color 0.2s",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    Already have an account? Sign in
                  </MuiLink>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </StyledCard>
      </Box>
    </Container>
  );
};

export default Register;
