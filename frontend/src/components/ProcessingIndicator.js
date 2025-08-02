import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FiLoader, FiAlertCircle, FiSearch } from 'react-icons/fi';

const Container = styled(motion.div)`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${props => props.theme.spacing.lg};
  border-radius: 50%;
  background: ${props => 
    props.error ? `${props.theme.colors.error}20` : `${props.theme.colors.primary}20`
  };
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 40px;
    height: 40px;
    color: ${props => 
      props.error ? props.theme.colors.error : props.theme.colors.primary
    };
    animation: ${props => props.isProcessing ? spin : 'none'} 2s linear infinite;
  }
`;

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.error ? props.theme.colors.error : props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Description = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.primary},
    ${props => props.theme.colors.secondary}
  );
  border-radius: 2px;
`;

const StepList = styled.div`
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
`;

const StepItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} 0;
  font-size: 0.9rem;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  
  svg {
    width: 16px;
    height: 16px;
    animation: ${props => props.active ? pulse : 'none'} 1.5s ease-in-out infinite;
  }
`;

const ErrorDetails = styled.div`
  background: ${props => props.theme.colors.error}10;
  border: 1px solid ${props => props.theme.colors.error}40;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  text-align: left;
  
  h4 {
    color: ${props => props.theme.colors.error};
    margin-bottom: ${props => props.theme.spacing.xs};
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  p {
    color: ${props => props.theme.colors.error};
    font-size: 0.85rem;
    line-height: 1.4;
  }
`;

const processingSteps = [
  { id: 1, text: 'Uploading image to server', icon: FiLoader },
  { id: 2, text: 'Analyzing image content', icon: FiSearch },
  { id: 3, text: 'Detecting QR codes', icon: FiSearch },
  { id: 4, text: 'Decoding QR content', icon: FiLoader },
  { id: 5, text: 'Preparing results', icon: FiLoader }
];

function ProcessingIndicator({ isProcessing, error }) {
  const [currentStep, setCurrentStep] = React.useState(1);

  React.useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= processingSteps.length) return 1;
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isProcessing]);

  if (error) {
    return (
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <IconContainer error>
          <FiAlertCircle />
        </IconContainer>
        
        <Title error>Processing Failed</Title>
        <Description>
          We encountered an error while processing your image.
        </Description>

        <ErrorDetails>
          <h4>Error Details:</h4>
          <p>{error}</p>
        </ErrorDetails>
      </Container>
    );
  }

  if (!isProcessing) return null;

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <IconContainer isProcessing>
        <FiLoader />
      </IconContainer>
      
      <Title>Processing QR Codes</Title>
      <Description>
        Analyzing your image and detecting QR codes. This usually takes a few seconds.
      </Description>

      <ProgressBar>
        <ProgressFill
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </ProgressBar>

      <StepList>
        {processingSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          
          return (
            <StepItem
              key={step.id}
              active={isActive}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: isActive || isCompleted ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <Icon />
              {step.text}
              {isCompleted && ' ✓'}
            </StepItem>
          );
        })}
      </StepList>
    </Container>
  );
}

export default ProcessingIndicator;