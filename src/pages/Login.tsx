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

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    login: "",
    password: "",
  });
  const { login, error, clearError } = useAuth();
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

    if (!formData.login.trim()) {
      newErrors.login = "Email or username is required";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(formData);
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
              Sign in to RoomLoop
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your credentials to access your account
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
                id="login"
                label="Email or Username"
                name="login"
                autoComplete="email"
                autoFocus
                value={formData.login}
                onChange={handleChange}
                error={!!formErrors.login}
                helperText={formErrors.login}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </StyledButton>
              <Grid container justifyContent="center">
                <Grid item>
                  <MuiLink
                    component={Link}
                    to="/register"
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
                    {"Don't have an account? Sign Up"}
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

export default Login;
