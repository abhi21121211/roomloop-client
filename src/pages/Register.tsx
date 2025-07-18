import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link as MuiLink,
  Stack,
  useTheme as useMuiTheme,
  alpha,
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
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        backgroundImage: `radial-gradient(circle at 20% 80%, ${alpha(
          theme.palette.primary.main,
          0.1
        )} 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, ${alpha(
                            theme.palette.secondary.main,
                            0.1
                          )} 0%, transparent 50%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container component="main" maxWidth="sm">
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
            <Stack spacing={4} alignItems="center" sx={{ width: "100%" }}>
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
                  mb: 2,
                }}
              >
                🎉 Join RoomLoop!
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
                  sx={{
                    mt: 4,
                    mb: 3,
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
                  🎉 Sign Up
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
    </Box>
  );
};

export default Register;
