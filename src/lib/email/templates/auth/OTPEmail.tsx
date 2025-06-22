import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";

interface OTPEmailProps {
  userFirstname?: string;
  otpCode?: string;
}

export const OTPEmail = ({ userFirstname, otpCode }: OTPEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>ExpressThat - Your One-Time Password Code</Preview>
        <Container style={container}>
          <Section>
            <Text style={text}>Hi {userFirstname},</Text>
            <Text style={text}>
              Here is your one-time password (OTP) code for your ExpressThat
              account:
            </Text>
            <Section style={otpContainer}>
              <Row>
                <Column align="center">
                  <Text style={otpCodeStyle}>{otpCode}</Text>
                </Column>
              </Row>
            </Section>
            <Text style={text}>
              This code will expire in 10 minutes for security reasons. Please
              enter it on the verification screen to continue.
            </Text>
            <Text style={text}>
              If you didn&apos;t request this code, please ignore this email or
              contact our support team if you have concerns about your account
              security.
            </Text>
            <Text style={text}>
              To keep your account secure, never share this code with anyone.
              ExpressThat will never ask you for your OTP code via email or
              phone.
            </Text>
            <Text style={text}>Don&apos;t forget to Express That</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

OTPEmail.PreviewProps = {
  userFirstname: "John",
  otpCode: "123456",
} as OTPEmailProps;

export default OTPEmail;

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
};

const otpContainer = {
  backgroundColor: "#f8f9fa",
  border: "2px dashed #007ee6",
  borderRadius: "8px",
  padding: "20px",
  margin: "30px 0",
};

const otpCodeStyle = {
  fontSize: "32px",
  fontFamily: "'Courier New', monospace",
  fontWeight: "bold",
  color: "#007ee6",
  letterSpacing: "4px",
  textAlign: "center" as const,
  margin: "0",
};
