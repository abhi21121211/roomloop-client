import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  alpha,
  useTheme,
  Collapse,
  Alert,
  Divider,
} from "@mui/material";
import {
  Summarize as SummaryIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  SentimentSatisfied as SentimentIcon,
} from "@mui/icons-material";
import { useAI } from "../../contexts/AIContext";

interface AIRoomSummaryProps {
  roomId: string;
  roomTitle: string;
  messageCount: number;
  participantCount: number;
  roomDuration: string;
}

interface SummaryData {
  summary: string;
  keyTopics: string[];
  participantCount: number;
  duration: string;
  sentiment: "positive" | "neutral" | "negative";
}

const AIRoomSummary: React.FC<AIRoomSummaryProps> = ({
  roomId,
  roomTitle,
  messageCount,
  participantCount,
  roomDuration,
}) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generateRoomSummary, isAvailable } = useAI();
  const theme = useTheme();

  const handleGenerateSummary = async () => {
    if (!isAvailable) {
      setError("AI features are not available");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const summaryData = await generateRoomSummary(roomId);
      setSummary(summaryData);
      setIsExpanded(true);
    } catch (error: any) {
      setError(error.message || "Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return theme.palette.success.main;
      case "negative":
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "negative":
        return "😔";
      default:
        return "😐";
    }
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <Card
      sx={{
        background: `linear-gradient(145deg, ${
          theme.palette.background.paper
        } 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.12)}`,
        },
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SummaryIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              AI Room Summary
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            startIcon={
              isGenerating ? <CircularProgress size={16} /> : <RefreshIcon />
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {isGenerating ? "Generating..." : "Generate Summary"}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Room Stats */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <Chip
            icon={<GroupIcon />}
            label={`${participantCount} participants`}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          />
          <Chip
            icon={<TrendingIcon />}
            label={`${messageCount} messages`}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.info.main,
                0.1
              )} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          />
          <Chip
            icon={<ScheduleIcon />}
            label={roomDuration}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.success.main,
                0.1
              )} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          />
        </Box>

        {/* Summary Content */}
        {summary && (
          <Collapse in={isExpanded}>
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />

              {/* Sentiment */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <SentimentIcon
                  sx={{ color: getSentimentColor(summary.sentiment) }}
                />
                <Typography variant="subtitle2" fontWeight={600}>
                  Overall Sentiment:{" "}
                  {summary.sentiment.charAt(0).toUpperCase() +
                    summary.sentiment.slice(1)}
                </Typography>
                <Typography variant="h6">
                  {getSentimentIcon(summary.sentiment)}
                </Typography>
              </Box>

              {/* Summary Text */}
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  background: alpha(theme.palette.grey[50], 0.5),
                  border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
                  lineHeight: 1.6,
                }}
              >
                {summary.summary}
              </Typography>

              {/* Key Topics */}
              {summary.keyTopics.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ mb: 1 }}
                  >
                    Key Topics Discussed:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {summary.keyTopics.map((topic, index) => (
                      <Chip
                        key={index}
                        label={topic}
                        size="small"
                        sx={{
                          background: `linear-gradient(135deg, ${alpha(
                            theme.palette.secondary.main,
                            0.1
                          )} 0%, ${alpha(
                            theme.palette.secondary.main,
                            0.05
                          )} 100%)`,
                          border: `1px solid ${alpha(
                            theme.palette.secondary.main,
                            0.2
                          )}`,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Expand/Collapse Button */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  size="small"
                  onClick={() => setIsExpanded(!isExpanded)}
                  endIcon={isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </Button>
              </Box>
            </Box>
          </Collapse>
        )}

        {/* No Summary State */}
        {!summary && !isGenerating && (
          <Box
            sx={{
              textAlign: "center",
              py: 3,
              color: "text.secondary",
            }}
          >
            <SummaryIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              Generate an AI-powered summary of this room's discussion
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRoomSummary;
