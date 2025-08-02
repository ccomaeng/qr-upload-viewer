import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiImage, FiFile, FiClock } from 'react-icons/fi';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ImageContainer = styled.div`
  position: relative;
  max-width: 100%;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 400px;
  height: auto;
  display: block;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    max-height: 300px;
  }
`;

const ImageInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  align-items: center;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
  border: 1px solid ${props => props.theme.colors.border};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const FileName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-align: center;
  word-break: break-word;
  max-width: 100%;
`;

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function ImagePreview({ image, uploadData }) {
  if (!image) return null;

  const fileSize = formatFileSize(image.file.size);
  const fileType = image.file.type.split('/')[1].toUpperCase();

  return (
    <Container
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FileName>{image.file.name}</FileName>
      
      <ImageContainer>
        <Image 
          src={image.previewUrl} 
          alt="Uploaded image for QR code detection"
        />
      </ImageContainer>

      <ImageInfo>
        <InfoItem>
          <FiImage />
          {fileType}
        </InfoItem>
        <InfoItem>
          <FiFile />
          {fileSize}
        </InfoItem>
        {uploadData && (
          <InfoItem>
            <FiClock />
            Uploaded
          </InfoItem>
        )}
      </ImageInfo>
    </Container>
  );
}

export default ImagePreview;