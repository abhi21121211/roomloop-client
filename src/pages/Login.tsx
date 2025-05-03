import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ErrorMessage from "../components/common/ErrorMessage";

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
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in to RoomLoop
        </Typography>

        <ErrorMessage message={error} />

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
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
          <TextField
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid>
              <MuiLink component={Link} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </MuiLink>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
