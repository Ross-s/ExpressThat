import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordUrl?: string;
}

//const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const ResetPasswordEmail = ({
  userFirstname,
  resetPasswordUrl,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>ExpressThat - Reset Your Password</Preview>
        <Container style={container}>
          <Section>
            <Text style={text}>Hi {userFirstname},</Text>
            <Text style={text}>
              We received a request to reset your password for your ExpressThat
              account.
            </Text>
            <Text style={text}>
              Click the button below to reset your password. This link will
              expire in 15 minutes for security reasons.
            </Text>
            <Button style={button} href={resetPasswordUrl}>
              Reset Your Password
            </Button>
            <Text style={text}>
              If you didn&apos;t request a password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </Text>
            <Text style={text}>
              To keep your account secure, please don&apos;t forward this email
              to anyone. See our Help Center for more security tips.
            </Text>
            <Text style={text}>Don&apos;t forget to Express That</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

ResetPasswordEmail.PreviewProps = {
  userFirstname: "name",
  resetPasswordUrl: "",
} as ResetPasswordEmailProps;

export default ResetPasswordEmail;

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

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "4px",
  color: "#fff",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
  margin: "0 auto",
};
