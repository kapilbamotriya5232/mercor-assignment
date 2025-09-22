import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ActivationEmailProps {
  name: string;
  activationLink: string;
  expiresIn?: string; // e.g., "24 hours"
}

export const ActivationEmail = ({
  name,
  activationLink,
  expiresIn = '24 hours',
}: ActivationEmailProps) => {
  const previewText = `Activate your Mercor account`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo Section */}
          <Section style={logoContainer}>
            <Heading style={h1}>Mercor</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Welcome to Mercor, {name}!
            </Heading>
            
            <Text style={paragraph}>
              Your account has been created and is ready to be activated. 
              Please click the button below to set your password and complete your registration.
            </Text>

            <Section style={buttonContainer}>
              <Button
                style={button}
                href={activationLink}
              >
                Activate Account
              </Button>
            </Section>

            <Text style={paragraph}>
              Or copy and paste this URL into your browser:
            </Text>
            
            <Link href={activationLink} style={link}>
              {activationLink}
            </Link>

            <Text style={warningText}>
              This link will expire in {expiresIn}. If you didn't request this activation,
              please ignore this email or contact support if you have concerns.
            </Text>

            {/* Instructions Section */}
            <Section style={instructionsSection}>
              <Heading as="h3" style={h3}>
                What happens next?
              </Heading>
              <Text style={paragraph}>
                1. Click the activation link above
              </Text>
              <Text style={paragraph}>
                2. Set your secure password
              </Text>
              <Text style={paragraph}>
                3. Download the Mercor desktop application
              </Text>
              <Text style={paragraph}>
                4. Start tracking your time on projects
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help? Contact our support team at{' '}
              <Link href="mailto:support@mercor.com" style={footerLink}>
                support@mercor.com
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Mercor. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const logoContainer = {
  padding: '32px 20px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e6ebf1',
};

const content = {
  padding: '40px 48px',
};

const h1 = {
  color: '#333',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 24px',
  padding: '0',
};

const h3 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
  padding: '0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  marginBottom: '16px',
};

const buttonContainer = {
  padding: '27px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  border: 'none',
};

const link = {
  color: '#5469d4',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const warningText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  marginBottom: '0',
  fontStyle: 'italic',
};

const instructionsSection = {
  backgroundColor: '#f6f9fc',
  borderRadius: '4px',
  padding: '24px',
  marginTop: '32px',
};

const footer = {
  borderTop: '1px solid #e6ebf1',
  padding: '32px 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  marginBottom: '8px',
};

const footerLink = {
  color: '#5469d4',
  textDecoration: 'underline',
};

export default ActivationEmail;
