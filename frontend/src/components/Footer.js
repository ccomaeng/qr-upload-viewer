import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.xl} 0;
  margin-top: ${props => props.theme.spacing.xxl};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.lg};
  text-align: center;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 0 ${props => props.theme.spacing.md};
  }
`;

const FooterText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: 1.6;
`;

const Links = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
  }
`;

const Link = styled.a`
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const Copyright = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
  opacity: 0.8;
`;

function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterText>
          Secure, fast, and reliable QR code detection and decoding.
          <br />
          Your images are processed securely and deleted automatically.
        </FooterText>
        
        <Links>
          <Link href="#privacy">Privacy Policy</Link>
          <Link href="#terms">Terms of Service</Link>
          <Link href="#contact">Contact</Link>
          <Link href="#api">API Docs</Link>
        </Links>
        
        <Copyright>
          © 2024 QR Viewer Pro. Built with React and Express.
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
}

export default Footer;