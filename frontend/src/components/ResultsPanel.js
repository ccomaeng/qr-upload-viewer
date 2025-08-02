import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiCopy, FiExternalLink, FiMail, FiPhone, FiMapPin, FiWifi, FiUser, FiMessageSquare, FiSearch, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Container = styled(motion.div)`
  margin-top: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};

  svg {
    color: ${props => props.theme.colors.success};
  }
`;

const Summary = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ProcessingInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const QRCodesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const QRCodeItem = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.primary}40;
  }
`;

const QRHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const QRType = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const ActionButton = styled(motion.button)`
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: ${props => props.theme.spacing.xs};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: ${props => props.theme.colors.textSecondary};

  &:hover {
    background: ${props => props.theme.colors.primary}10;
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ContentArea = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  border-left: 4px solid ${props => props.theme.colors.success};
  position: relative;
`;

const ContentText = styled.div`
  font-family: 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  word-break: break-all;
  color: ${props => props.theme.colors.text};
  white-space: pre-wrap;
  max-height: ${props => props.expanded ? 'none' : '120px'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: ${props => props.theme.spacing.sm};
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const NoResultsContainer = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const NoResultsIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const NoResultsTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text};
`;

const NoResultsText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
`;

const QRGeneratorSection = styled(motion.div)`
  margin-top: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const QRGeneratorHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const QRGeneratorTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
`;

const QRGeneratorDescription = styled.p`
  font-size: 0.95rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const QRGenerateButton = styled(motion.button)`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  margin: 0 auto;
  min-width: 180px;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background: ${props => props.theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;

const QRDisplayArea = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
  text-align: center;
`;

const QRImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const QRDownloadButton = styled(motion.button)`
  background: ${props => props.theme.colors.success};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin: 0 auto;

  &:hover {
    background: ${props => props.theme.colors.successDark || '#27ae60'};
  }
`;

// QR code type detection and icons
const getQRTypeInfo = (content) => {
  const url = /^https?:\/\/.+/i;
  const email = /^mailto:.+|^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  const phone = /^tel:|^\+?[\d\s\-()]+$/;
  const wifi = /^WIFI:/i;
  const vcard = /^BEGIN:VCARD/i;
  const geo = /^geo:/i;
  const sms = /^sms:/i;

  if (url.test(content)) return { type: 'URL', icon: FiExternalLink, color: '#3498db' };
  if (email.test(content)) return { type: 'Email', icon: FiMail, color: '#e74c3c' };
  if (phone.test(content)) return { type: 'Phone', icon: FiPhone, color: '#27ae60' };
  if (wifi.test(content)) return { type: 'WiFi', icon: FiWifi, color: '#9b59b6' };
  if (vcard.test(content)) return { type: 'Contact', icon: FiUser, color: '#f39c12' };
  if (geo.test(content)) return { type: 'Location', icon: FiMapPin, color: '#e67e22' };
  if (sms.test(content)) return { type: 'SMS', icon: FiMessageSquare, color: '#1abc9c' };
  
  return { type: 'Text', icon: FiSearch, color: '#7f8c8d' };
};

function QRCodeResult({ qr, index }) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = getQRTypeInfo(qr.content);
  const TypeIcon = typeInfo.icon;
  const shouldShowExpand = qr.content.length > 200;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qr.content);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleOpen = () => {
    const content = qr.content;
    
    if (content.startsWith('http://') || content.startsWith('https://')) {
      window.open(content, '_blank', 'noopener,noreferrer');
    } else if (content.startsWith('mailto:')) {
      window.location.href = content;
    } else if (content.startsWith('tel:')) {
      window.location.href = content;
    } else if (content.startsWith('sms:')) {
      window.location.href = content;
    } else if (content.startsWith('geo:')) {
      const coords = content.replace('geo:', '').split(',');
      if (coords.length >= 2) {
        window.open(`https://maps.google.com?q=${coords[0]},${coords[1]}`, '_blank');
      }
    } else {
      toast('This QR code type cannot be opened directly', { icon: 'ℹ️' });
    }
  };

  const canOpen = /^(https?:|mailto:|tel:|sms:|geo:)/i.test(qr.content);

  return (
    <QRCodeItem
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <QRHeader>
        <QRType style={{ color: typeInfo.color, backgroundColor: `${typeInfo.color}15` }}>
          <TypeIcon />
          {typeInfo.type}
        </QRType>
        
        <ActionButtons>
          <ActionButton
            onClick={handleCopy}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Copy to clipboard"
          >
            <FiCopy />
          </ActionButton>
          
          {canOpen && (
            <ActionButton
              onClick={handleOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Open"
            >
              <FiExternalLink />
            </ActionButton>
          )}
        </ActionButtons>
      </QRHeader>

      <ContentArea>
        <ContentText expanded={expanded}>
          {qr.content}
        </ContentText>
        
        {shouldShowExpand && (
          <ExpandButton onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show less' : 'Show more'}
          </ExpandButton>
        )}
      </ContentArea>
    </QRCodeItem>
  );
}

function ResultsPanel({ results, uploadData, onGenerateQR, qrData, isGeneratingQR }) {
  if (!results) return null;

  const hasQRCodes = results.qrCodes && results.qrCodes.length > 0;

  const handleDownloadQR = () => {
    if (qrData?.qrImageUrl) {
      const link = document.createElement('a');
      link.href = `${process.env.REACT_APP_API_BASE_URL || 'http://192.168.25.54:3001'}${qrData.qrImageUrl}`;
      link.download = `qr-code-${uploadData?.uploadId || 'image'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded!');
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Header>
        <Title>
          <FiCheckCircle />
          {hasQRCodes ? 'QR Codes Found!' : 'Processing Complete'}
        </Title>
        
        {hasQRCodes ? (
          <Summary>
            Found {results.qrCodes.length} QR code{results.qrCodes.length !== 1 ? 's' : ''} in your image
          </Summary>
        ) : (
          <Summary>
            No QR codes were detected in this image
          </Summary>
        )}

        <ProcessingInfo>
          <span>Processed in {results.processingTime}ms</span>
          <span>•</span>
          <span>Upload ID: {results.uploadId.slice(0, 8)}...</span>
        </ProcessingInfo>
      </Header>

      {hasQRCodes && (
        <QRCodesList>
          <AnimatePresence>
            {results.qrCodes.map((qr, index) => (
              <QRCodeResult 
                key={index} 
                qr={qr} 
                index={index}
              />
            ))}
          </AnimatePresence>
        </QRCodesList>
      )}

      {/* QR Generator Section */}
      <QRGeneratorSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <QRGeneratorHeader>
          <QRGeneratorTitle>
            📱 Generate QR Code
          </QRGeneratorTitle>
          <QRGeneratorDescription>
            Create a QR code that links to this uploaded image for easy sharing
          </QRGeneratorDescription>
        </QRGeneratorHeader>

        {!qrData ? (
          <QRGenerateButton
            onClick={() => onGenerateQR?.(uploadData?.uploadId)}
            disabled={isGeneratingQR || !uploadData?.uploadId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGeneratingQR ? '🔄 Generating...' : '✨ Generate QR Code'}
          </QRGenerateButton>
        ) : (
          <QRDisplayArea>
            <QRImage 
              src={`${process.env.REACT_APP_API_BASE_URL || 'http://192.168.25.54:3001'}${qrData.qrImageUrl}`}
              alt="Generated QR Code"
            />
            <div>
              <QRDownloadButton
                onClick={handleDownloadQR}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiDownload />
                Download QR Code
              </QRDownloadButton>
            </div>
          </QRDisplayArea>
        )}
      </QRGeneratorSection>
    </Container>
  );
}

export default ResultsPanel;