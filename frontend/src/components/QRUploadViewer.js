import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import UploadZone from './UploadZone';
import ImagePreview from './ImagePreview';
import ProcessingIndicator from './ProcessingIndicator';
import ResultsPanel from './ResultsPanel';
import { uploadImageSimple as uploadImage, getResultsSimple as getResults, generateQRCode, getQRCode } from '../services/api-simple';

const Container = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  overflow: hidden;
  min-height: 600px;
`;

const ContentArea = styled.div`
  padding: ${props => props.theme.spacing.xxl};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.lg};
  }
`;

const ResetButton = styled(motion.button)`
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
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.lg};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background: ${props => props.theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.md};
`;

const Step = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.background};
  color: ${props => props.active ? 'white' : props.theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
`;

const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.active ? 'white' : props.theme.colors.border};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
`;

function QRUploadViewer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadData, setUploadData] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const steps = [
    { number: 1, label: 'Upload Image' },
    { number: 2, label: 'Processing' },
    { number: 3, label: 'View Results' }
  ];

  // Handle file upload
  const handleFileUpload = useCallback(async (file) => {
    try {
      setError(null);
      setIsProcessing(true);
      setCurrentStep(2);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage({ file, previewUrl });

      // Upload to server
      const response = await uploadImage(file);
      setUploadData(response.data);
      
      toast.success('Image uploaded successfully! Processing QR codes...');

      // Poll for results
      const pollForResults = async () => {
        try {
          const resultsResponse = await getResults(response.data.uploadId);
          const resultsData = resultsResponse.data;

          if (resultsData.status === 'completed') {
            setResults(resultsData);
            setCurrentStep(3);
            setIsProcessing(false);
            
            if (resultsData.qrCodes.length > 0) {
              toast.success(`Found ${resultsData.qrCodes.length} QR code${resultsData.qrCodes.length !== 1 ? 's' : ''}!`);
            } else {
              toast('No QR codes found in the image', { icon: 'ℹ️' });
            }
          } else if (resultsData.status === 'failed') {
            throw new Error(resultsData.error || 'Processing failed');
          } else {
            // Still processing, poll again
            setTimeout(pollForResults, 1000);
          }
        } catch (error) {
          console.error('Error polling results:', error);
          setError(error.message);
          setIsProcessing(false);
          toast.error('Failed to process image');
        }
      };

      // Start polling after a short delay
      setTimeout(pollForResults, 500);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || error.message || 'Upload failed');
      setIsProcessing(false);
      setCurrentStep(1);
      toast.error('Failed to upload image');
    }
  }, []);

  // Handle QR code generation
  const handleGenerateQR = useCallback(async (uploadId) => {
    try {
      setIsGeneratingQR(true);
      setError(null);
      
      toast.loading('Generating QR code...', { id: 'qr-generation' });
      
      const response = await generateQRCode(uploadId);
      setQrData(response.data);
      
      toast.success('QR code generated successfully!', { id: 'qr-generation' });
      
    } catch (error) {
      console.error('QR generation error:', error);
      setError(error.message);
      toast.error('Failed to generate QR code', { id: 'qr-generation' });
    } finally {
      setIsGeneratingQR(false);
    }
  }, []);

  // Reset to initial state
  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setUploadData(null);
    setUploadedImage(null);
    setIsProcessing(false);
    setResults(null);
    setError(null);
    setQrData(null);
    setIsGeneratingQR(false);
    
    // Clean up object URL
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
  }, [uploadedImage]);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ContentArea>
        {/* Step Indicator */}
        <StepIndicator>
          {steps.map((step) => (
            <Step
              key={step.number}
              active={currentStep === step.number}
              initial={{ scale: 0.9 }}
              animate={{ scale: currentStep === step.number ? 1 : 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <StepNumber active={currentStep === step.number}>
                {step.number}
              </StepNumber>
              {step.label}
            </Step>
          ))}
        </StepIndicator>

        {/* Content based on current step */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <UploadZone 
                onFileUpload={handleFileUpload}
                disabled={isProcessing}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {uploadedImage && (
                <ImagePreview 
                  image={uploadedImage}
                  uploadData={uploadData}
                />
              )}
              <ProcessingIndicator 
                isProcessing={isProcessing}
                error={error}
              />
            </motion.div>
          )}

          {currentStep === 3 && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {uploadedImage && (
                <ImagePreview 
                  image={uploadedImage}
                  uploadData={uploadData}
                />
              )}
              <ResultsPanel 
                results={results}
                uploadData={uploadData}
                onGenerateQR={handleGenerateQR}
                qrData={qrData}
                isGeneratingQR={isGeneratingQR}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Button */}
        {(currentStep > 1 || error) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ResetButton
              onClick={handleReset}
              disabled={isProcessing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🔄 Upload New Image
            </ResetButton>
          </motion.div>
        )}
      </ContentArea>
    </Container>
  );
}

export default QRUploadViewer;