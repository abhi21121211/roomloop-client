import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  CardMedia,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Check as CheckIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as SkipIcon,
  Help as HelpIcon,
  VideoCall as VideoCallIcon,
  Chat as ChatIcon,
  Explore as ExploreIcon,
  Settings as SettingsIcon,
  Accessibility as AccessibilityIcon,
} from "@mui/icons-material";
import { useTheme } from "../../contexts/ThemeContext";
import AccessibleButton from "./AccessibleButton";

// Onboarding step interface
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  videoUrl?: string;
  interactive?: boolean;
  required?: boolean;
}

// Onboarding flow props
interface OnboardingFlowProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  userType?: "new" | "returning";
  skipOnboarding?: boolean;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  open,
  onClose,
  onComplete,
  userType = "new",
  skipOnboarding = false,
}) => {
  const { actualTheme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [skippedSteps, setSkippedSteps] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  // Onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to RoomLoop!",
      description: "Let's get you started with your virtual events journey",
      content: (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <VideoCallIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            Welcome to RoomLoop
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            RoomLoop is your platform for creating and joining virtual events,
            meetups, and discussions. Let's take a quick tour to help you get
            the most out of your experience.
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}
          >
            <Chip label="Virtual Events" color="primary" />
            <Chip label="Real-time Chat" color="primary" />
            <Chip label="Screen Sharing" color="primary" />
            <Chip label="Accessibility" color="primary" />
          </Box>
        </Box>
      ),
      required: true,
    },
    {
      id: "explore",
      title: "Explore Rooms",
      description: "Discover and join interesting virtual rooms",
      content: (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardMedia
              component="img"
              height="140"
              image="/api/placeholder/400/140"
              alt="Explore rooms interface"
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Browse Public Rooms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discover rooms by category, topic, or popularity. Join
                discussions on topics that interest you.
              </Typography>
            </CardContent>
          </Card>
          <List>
            <ListItem>
              <ListItemIcon>
                <ExploreIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Browse by Category"
                secondary="Find rooms in technology, business, education, and more"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ChatIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Join Discussions"
                secondary="Participate in real-time conversations with other users"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Save Favorites"
                secondary="Bookmark rooms you want to visit later"
              />
            </ListItem>
          </List>
        </Box>
      ),
      interactive: true,
    },
    {
      id: "create",
      title: "Create Your Room",
      description: "Start your own virtual event or discussion",
      content: (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Creating a room is easy! Just fill out a few details and you're
            ready to go.
          </Alert>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Public Room
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Anyone can discover and join your room
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Private Room
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Only invited users can join your room
              </Typography>
            </Paper>
          </Box>
          <List sx={{ mt: 2 }}>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Choose Room Type"
                secondary="Public for open discussions, private for exclusive events"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Set Schedule"
                secondary="Schedule your room for a specific date and time"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Invite Participants"
                secondary="Send invitations to specific users or share a link"
              />
            </ListItem>
          </List>
        </Box>
      ),
      interactive: true,
    },
    {
      id: "chat",
      title: "Real-time Chat",
      description: "Communicate with participants in real-time",
      content: (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardMedia
              component="img"
              height="200"
              image="/api/placeholder/400/200"
              alt="Chat interface"
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interactive Chat Features
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send messages, reactions, and files to enhance your
                conversations.
              </Typography>
            </CardContent>
          </Card>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
            }}
          >
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                💬 Text Messages
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send and receive text messages in real-time
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                😊 Reactions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                React to messages with emojis
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                📎 File Sharing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share images, documents, and other files
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                🎤 Voice Messages
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send voice messages for quick communication
              </Typography>
            </Paper>
          </Box>
        </Box>
      ),
      interactive: true,
    },
    {
      id: "accessibility",
      title: "Accessibility Features",
      description: "RoomLoop is designed to be accessible for everyone",
      content: (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            RoomLoop includes comprehensive accessibility features to ensure
            everyone can participate.
          </Alert>
          <List>
            <ListItem>
              <ListItemIcon>
                <AccessibilityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Screen Reader Support"
                secondary="Full compatibility with screen readers and assistive technologies"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AccessibilityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Keyboard Navigation"
                secondary="Complete keyboard accessibility for all features"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AccessibilityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="High Contrast Mode"
                secondary="Enhanced contrast options for better visibility"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AccessibilityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Font Size Adjustment"
                secondary="Customize text size to your preference"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AccessibilityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Reduced Motion"
                secondary="Option to reduce animations for motion sensitivity"
              />
            </ListItem>
          </List>
        </Box>
      ),
    },
    {
      id: "settings",
      title: "Customize Your Experience",
      description: "Personalize RoomLoop to match your preferences",
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Make RoomLoop work for you with these customization options:
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
              mb: 2,
            }}
          >
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <SettingsIcon
                sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
              />
              <Typography variant="h6" gutterBottom>
                Theme Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose between light, dark, or system theme
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <AccessibilityIcon
                sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
              />
              <Typography variant="h6" gutterBottom>
                Accessibility
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adjust font size, contrast, and motion settings
              </Typography>
            </Paper>
          </Box>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Notification Preferences"
                secondary="Control when and how you receive notifications"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Privacy Settings"
                secondary="Manage your profile visibility and data sharing"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Language Options"
                secondary="Choose your preferred language (coming soon)"
              />
            </ListItem>
          </List>
        </Box>
      ),
    },
  ];

  // Handle step completion
  const handleStepComplete = (stepId: string) => {
    setCompletedSteps((prev) => new Set(Array.from(prev).concat(stepId)));
    handleNext();
  };

  // Handle step skip
  const handleStepSkip = (stepId: string) => {
    setSkippedSteps((prev) => new Set(Array.from(prev).concat(stepId)));
    handleNext();
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handleComplete();
    }
  };

  // Handle previous step
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // Handle complete
  const handleComplete = () => {
    localStorage.setItem("onboarding-completed", "true");
    onComplete();
  };

  // Handle skip onboarding
  const handleSkipOnboarding = () => {
    localStorage.setItem("onboarding-skipped", "true");
    onComplete();
  };

  // Progress calculation
  const progress =
    ((completedSteps.size + skippedSteps.size) / steps.length) * 100;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: actualTheme === "dark" ? "#1e1e1e" : "#ffffff",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HelpIcon color="primary" />
          <Typography variant="h6" component="h2">
            Welcome to RoomLoop
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="Close onboarding"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Progress bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel
                optional={
                  step.required ? undefined : (
                    <Chip label="Optional" size="small" variant="outlined" />
                  )
                }
                sx={{
                  "& .MuiStepLabel-label": {
                    fontWeight: activeStep === index ? 600 : 400,
                  },
                }}
              >
                {step.title}
              </StepLabel>
              <StepContent>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                {step.content}
                <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
                  <AccessibleButton
                    variant="contained"
                    onClick={() => handleStepComplete(step.id)}
                    ariaLabel={`Complete ${step.title} step`}
                  >
                    {index === steps.length - 1 ? "Finish" : "Continue"}
                  </AccessibleButton>
                  {!step.required && (
                    <AccessibleButton
                      variant="outlined"
                      onClick={() => handleStepSkip(step.id)}
                      ariaLabel={`Skip ${step.title} step`}
                    >
                      Skip
                    </AccessibleButton>
                  )}
                  {index > 0 && (
                    <AccessibleButton
                      variant="text"
                      onClick={handleBack}
                      ariaLabel="Go to previous step"
                    >
                      Back
                    </AccessibleButton>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {skipOnboarding && (
          <AccessibleButton
            variant="text"
            onClick={handleSkipOnboarding}
            ariaLabel="Skip entire onboarding"
          >
            Skip Onboarding
          </AccessibleButton>
        )}
        <Box sx={{ flex: 1 }} />
        <AccessibleButton
          variant="outlined"
          onClick={onClose}
          ariaLabel="Close onboarding"
        >
          Close
        </AccessibleButton>
        <AccessibleButton
          variant="contained"
          onClick={handleComplete}
          ariaLabel="Complete onboarding"
        >
          Get Started
        </AccessibleButton>
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingFlow;
