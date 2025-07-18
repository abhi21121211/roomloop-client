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
                🚀 Welcome Back!
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
                  🔐 Sign In
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
    </Box>
  );
};

export default Login;
