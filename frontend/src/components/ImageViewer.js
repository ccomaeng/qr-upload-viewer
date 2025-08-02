import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiDownload, FiArrowLeft, FiShare2, FiCalendar, FiFile, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Container = styled(motion.div)`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.lg};
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const BackButton = styled(motion.button)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: ${props => props.theme.colors.textSecondary};

  &:hover {
    background: ${props => props.theme.colors.primary}10;
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-weight: 500;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  &.secondary {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
    border: 1px solid ${props => props.theme.colors.border};

    &:hover {
      background: ${props => props.theme.colors.border};
    }
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const ImageSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: ${props => props.theme.borderRadius.md};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${props => props.theme.colors.border};
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const InfoPanel = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.95rem;

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.theme.colors.primary};
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.text};
  }
`;

function ImageViewer() {
  const { uploadId } = useParams();
  const navigate = useNavigate();
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImageData();
  }, [uploadId]);

  const fetchImageData = async () => {
    try {
      setLoading(true);
      
      // Get upload info
      const uploadResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://192.168.25.54:3001'}/api/uploads/${uploadId}`);
      
      if (!uploadResponse.ok) {
        throw new Error('Image not found');
      }
      
      const uploadData = await uploadResponse.json();
      
      // Get QR results
      const resultsResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://192.168.25.54:3001'}/api/results/${uploadId}`);
      let qrCodes = [];
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        qrCodes = resultsData.qrCodes || [];
      }
      
      setImageData({
        ...uploadData.upload,
        qrCodes
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (imageData && imageData.filename) {
      const link = document.createElement('a');
      link.href = `${process.env.REACT_APP_API_BASE_URL || 'http://192.168.25.54:3001'}/uploads/${imageData.filename}`;
      link.download = imageData.originalName || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared Image',
          text: `Check out this image: ${imageData?.originalName || 'Uploaded Image'}`,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard copy
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <BackButton onClick={() => navigate('/')}>
            <FiArrowLeft />
          </BackButton>
          <Title>Loading Image...</Title>
        </Header>
        <Content>
          <ImageSection>
            <ImageContainer>
              <LoadingSpinner />
            </ImageContainer>
          </ImageSection>
        </Content>
      </Container>
    );
  }

  if (error || !imageData) {
    return (
      <Container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <BackButton onClick={() => navigate('/')}>
            <FiArrowLeft />
          </BackButton>
          <Title>Image Not Found</Title>
        </Header>
        <ErrorMessage>
          <h2>😞 Image Not Found</h2>
          <p>The image you're looking for doesn't exist or has been removed.</p>
          <ActionButton 
            as={motion.button}
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '20px' }}
          >
            <FiArrowLeft />
            Go Back Home
          </ActionButton>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <BackButton
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiArrowLeft />
        </BackButton>
        <Title>{imageData?.originalName || 'Uploaded Image'}</Title>
        <ActionButtons>
          <ActionButton
            className="secondary"
            onClick={handleShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiShare2 />
            Share
          </ActionButton>
          <ActionButton
            onClick={handleDownload}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiDownload />
            Download
          </ActionButton>
        </ActionButtons>
      </Header>

      <Content>
        <ImageSection>
          <ImageContainer>
            <Image 
              src={imageData.filename ? `${process.env.REACT_APP_API_BASE_URL || 'http://192.168.25.54:3001'}/uploads/${imageData.filename}` : ''}
              alt={imageData.originalName || 'Uploaded Image'}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDOTMuMzcgNzAgODggNzUuMzcgODggODJWMTE4Qzg4IDEyNC42MyA5My4zNyAxMzAgMTAwIDEzMEMxMDYuNjMgMTMwIDExMiAxMjQuNjMgMTEyIDExOFY4MkMxMTIgNzUuMzcgMTA2LjYzIDcwIDEwMCA3MFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHBhdGggZD0iTTEwMCA1MEMxMDYuNjMgNTAgMTEyIDU1LjM3IDExMiA2MkMxMTIgNjguNjMgMTA2LjYzIDc0IDEwMCA3NEM5My4zNyA3NCA4OCA2OC42MyA4OCA2MkM4OCA1NS4zNyA5My4zNyA1MCAxMDAgNTBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjwvc3ZnPgo=';
              }}
            />
          </ImageContainer>
        </ImageSection>

        <Sidebar>
          <InfoPanel>
            <InfoTitle>
              <FiFile />
              Image Information
            </InfoTitle>
            <InfoItem>
              <FiCalendar />
              <span>Uploaded: {formatDate(imageData.uploadTime)}</span>
            </InfoItem>
            <InfoItem>
              <FiFile />
              <span>Original Name: {imageData.originalName}</span>
            </InfoItem>
            <InfoItem>
              <FiHeart />
              <span>Upload ID: {imageData.id.slice(0, 8)}...</span>
            </InfoItem>
            <InfoItem>
              <span>Processing Time: {imageData.processingTime}ms</span>
            </InfoItem>
          </InfoPanel>

          {imageData.qrCodes && imageData.qrCodes.length > 0 && (
            <InfoPanel>
              <InfoTitle>
                📱 QR Codes Found
              </InfoTitle>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>
                This image contains {imageData.qrCodes.length} QR code{imageData.qrCodes.length !== 1 ? 's' : ''}.
              </p>
            </InfoPanel>
          )}
        </Sidebar>
      </Content>
    </Container>
  );
}

export default ImageViewer;