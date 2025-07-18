import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Description as DocumentIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useTheme } from "../../contexts/ThemeContext";
import AccessibleButton from "./AccessibleButton";

// File interface
interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  preview?: string;
}

// File type categories
const fileTypes = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
};

// Get file icon based on type
const getFileIcon = (file: File) => {
  if (fileTypes.image.includes(file.type)) return <ImageIcon />;
  if (fileTypes.video.includes(file.type)) return <VideoIcon />;
  if (fileTypes.audio.includes(file.type)) return <AudioIcon />;
  if (fileTypes.document.includes(file.type)) return <DocumentIcon />;
  return <FileIcon />;
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Drag and drop upload props
interface DragDropUploadProps {
  onFilesSelect: (files: File[]) => void;
  onFileUpload?: (file: UploadFile) => Promise<void>;
  onFileRemove?: (fileId: string) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  uploadText?: string;
  dragText?: string;
  error?: string;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFilesSelect,
  onFileUpload,
  onFileRemove,
  acceptedTypes = [],
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  disabled = false,
  loading = false,
  uploadText = "Click to upload or drag and drop files here",
  dragText = "Drop files here",
  error,
}) => {
  const { actualTheme } = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check file type
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }

    return null;
  };

  // Handle file selection
  const handleFilesSelect = useCallback(
    (selectedFiles: FileList | File[]) => {
      const fileArray = Array.from(selectedFiles);
      const validFiles: File[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      // Show errors if any
      if (errors.length > 0) {
        console.error("File validation errors:", errors);
      }

      // Add valid files
      if (validFiles.length > 0) {
        const newUploadFiles: UploadFile[] = validFiles.map((file) => ({
          id: `${Date.now()}-${Math.random()}`,
          file,
          progress: 0,
          status: "pending" as const,
        }));

        setFiles((prev) => {
          const updated = [...prev, ...newUploadFiles];
          return updated.slice(0, maxFiles);
        });

        onFilesSelect(validFiles);

        // Auto-upload if upload function provided
        if (onFileUpload) {
          newUploadFiles.forEach((uploadFile) => {
            handleFileUpload(uploadFile);
          });
        }
      }
    },
    [acceptedTypes, maxFileSize, maxFiles, onFilesSelect, onFileUpload]
  );

  // Handle file upload
  const handleFileUpload = async (uploadFile: UploadFile) => {
    if (!onFileUpload) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "uploading" } : f
      )
    );

    try {
      await onFileUpload(uploadFile);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "success", progress: 100 }
            : f
        )
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
    }
  };

  // Handle file removal
  const handleFileRemove = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    onFileRemove?.(fileId);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFilesSelect(droppedFiles);
      }
    },
    [disabled, handleFilesSelect]
  );

  // Click to upload
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // File input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleFilesSelect(selectedFiles);
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
        aria-label="File upload input"
      />

      {/* Upload area */}
      <Paper
        elevation={isDragOver ? 8 : 1}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${
            isDragOver
              ? "primary.main"
              : actualTheme === "dark"
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.2)"
          }`,
          borderRadius: 3,
          p: 4,
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          backgroundColor: isDragOver
            ? "primary.main"
            : actualTheme === "dark"
            ? "rgba(255,255,255,0.02)"
            : "rgba(0,0,0,0.02)",
          "&:hover": {
            borderColor: disabled ? undefined : "primary.main",
            backgroundColor: disabled
              ? undefined
              : actualTheme === "dark"
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.04)",
          },
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={uploadText}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <UploadIcon
          sx={{
            fontSize: 48,
            color: isDragOver ? "primary.contrastText" : "text.secondary",
            mb: 2,
          }}
        />
        <Typography
          variant="h6"
          component="h3"
          sx={{
            mb: 1,
            color: isDragOver ? "primary.contrastText" : "text.primary",
          }}
        >
          {isDragOver ? dragText : uploadText}
        </Typography>
        <Typography
          variant="body2"
          color={isDragOver ? "primary.contrastText" : "text.secondary"}
        >
          {acceptedTypes.length > 0
            ? `Supported formats: ${acceptedTypes.join(", ")}`
            : "All file types supported"}
        </Typography>
        <Typography
          variant="caption"
          color={isDragOver ? "primary.contrastText" : "text.secondary"}
          sx={{ display: "block", mt: 1 }}
        >
          Max file size: {formatFileSize(maxFileSize)}
          {multiple && ` • Max files: ${maxFiles}`}
        </Typography>
      </Paper>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* File list */}
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" component="h4" sx={{ mb: 2 }}>
            Selected Files ({files.length}/{maxFiles})
          </Typography>
          <List sx={{ p: 0 }}>
            {files.map((uploadFile) => (
              <ListItem
                key={uploadFile.id}
                sx={{
                  border: `1px solid ${
                    actualTheme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.08)"
                  }`,
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: "background.paper",
                }}
              >
                <ListItemIcon>
                  {uploadFile.status === "success" ? (
                    <SuccessIcon color="success" />
                  ) : uploadFile.status === "error" ? (
                    <ErrorIcon color="error" />
                  ) : (
                    getFileIcon(uploadFile.file)
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={uploadFile.file.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(uploadFile.file.size)}
                      </Typography>
                      {uploadFile.status === "uploading" && (
                        <LinearProgress
                          variant="determinate"
                          value={uploadFile.progress}
                          sx={{ mt: 1 }}
                        />
                      )}
                      {uploadFile.status === "error" && uploadFile.error && (
                        <Typography variant="caption" color="error">
                          {uploadFile.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleFileRemove(uploadFile.id)}
                    aria-label={`Remove ${uploadFile.file.name}`}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default DragDropUpload;
