import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUpload, FiImage, FiAlertCircle } from 'react-icons/fi';

const DropzoneContainer = styled(motion.div)`
  border: 3px dashed ${props => 
    props.isDragActive ? props.theme.colors.primary :
    props.isDragReject ? props.theme.colors.error :
    props.theme.colors.border
  };
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xxl};
  text-align: center;
  cursor: pointer;
  background: ${props => 
    props.isDragActive ? `${props.theme.colors.primary}10` :
    props.isDragReject ? `${props.theme.colors.error}10` :
    props.theme.colors.background
  };
  transition: all 0.3s ease;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.lg};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}05;
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.xl};
    min-height: 250px;
  }
`;

const IconContainer = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => 
    props.isDragActive ? props.theme.colors.primary :
    props.isDragReject ? props.theme.colors.error :
    props.theme.colors.primary
  }20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};

  svg {
    width: 40px;
    height: 40px;
    color: ${props => 
      props.isDragActive ? props.theme.colors.primary :
      props.isDragReject ? props.theme.colors.error :
      props.theme.colors.primary
    };
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 60px;
    height: 60px;
    
    svg {
      width: 30px;
      height: 30px;
    }
  }
`;

const MainText = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.25rem;
  }
`;

const SubText = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  line-height: 1.5;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 0.9rem;
  }
`;

const FileInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  margin-top: ${props => props.theme.spacing.lg};
`;

const FileInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
  border: 1px solid ${props => props.theme.colors.border};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ErrorMessage = styled(motion.div)`
  background: ${props => props.theme.colors.error}10;
  border: 1px solid ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.error};
  font-size: 0.9rem;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const BrowseButton = styled(motion.button)`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: ${props => props.theme.spacing.md};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background: ${props => props.theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;

const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function UploadZone({ onFileUpload, disabled }) {
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setUploadError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'File upload failed';

      if (rejection.errors) {
        const error = rejection.errors[0];
        switch (error.code) {
          case 'file-too-large':
            errorMessage = `File is too large. Maximum size is ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)}MB.`;
            break;
          case 'file-invalid-type':
            errorMessage = 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.';
            break;
          case 'too-many-files':
            errorMessage = 'Please upload only one file at a time.';
            break;
          default:
            errorMessage = error.message || 'File upload failed';
        }
      }

      setUploadError(errorMessage);
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Additional validation
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`File is too large. Maximum size is ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)}MB.`);
        return;
      }

      onFileUpload(file);
    }
  }, [onFileUpload]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    open
  } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    disabled,
    noClick: false,
    noKeyboard: false
  });

  const iconVariants = {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5 },
    drag: { scale: 1.2, rotate: 10 }
  };

  const containerVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.01 },
    drag: { scale: 1.02 }
  };

  return (
    <>
      <DropzoneContainer
        {...getRootProps()}
        isDragActive={isDragActive}
        isDragReject={isDragReject}
        variants={containerVariants}
        initial="idle"
        whileHover="hover"
        animate={isDragActive ? "drag" : "idle"}
        disabled={disabled}
      >
        <input {...getInputProps()} />
        
        <IconContainer
          isDragActive={isDragActive}
          isDragReject={isDragReject}
          variants={iconVariants}
          initial="idle"
          animate={isDragActive ? "drag" : "idle"}
        >
          {isDragReject ? (
            <FiAlertCircle />
          ) : (
            <FiUpload />
          )}
        </IconContainer>

        {isDragActive ? (
          isDragReject ? (
            <>
              <MainText>Invalid file type</MainText>
              <SubText>Please upload a JPEG, PNG, GIF, or WebP image</SubText>
            </>
          ) : (
            <>
              <MainText>Drop your image here</MainText>
              <SubText>Release to upload and process QR codes</SubText>
            </>
          )
        ) : (
          <>
            <MainText>Upload QR Code Image</MainText>
            <SubText>
              Drag and drop an image here, or click to browse
              <br />
              We'll automatically detect and decode any QR codes
            </SubText>
            
            <BrowseButton
              type="button"
              onClick={open}
              disabled={disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Choose File
            </BrowseButton>
          </>
        )}

        <FileInfo>
          <FileInfoItem>
            <FiImage />
            JPEG, PNG, GIF, WebP
          </FileInfoItem>
          <FileInfoItem>
            📏 Max 10MB
          </FileInfoItem>
          <FileInfoItem>
            🔍 Auto QR Detection
          </FileInfoItem>
        </FileInfo>
      </DropzoneContainer>

      {uploadError && (
        <ErrorMessage
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiAlertCircle />
          {uploadError}
        </ErrorMessage>
      )}
    </>
  );
}

export default UploadZone;