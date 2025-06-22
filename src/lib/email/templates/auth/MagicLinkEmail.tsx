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

interface MagicLinkEmailProps {
  verifyEmailUrl?: string;
}

//const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const MagicLinkEmail = ({
  verifyEmailUrl,
}: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>ExpressThat - Verify Email</Preview>
        <Container style={container}>
          <Section>
            <Text style={text}>Hi,</Text>
            <Text style={text}>
              Welcome to ExpressThat! We&apos;re excited to have you on board.
            </Text>
            <Button style={button} href={verifyEmailUrl}>
              Login to Your Account
            </Button>
            <Text style={text}>
              To keep your account secure, please don&apos;t forward this email
              to anyone. See our Help Center for{" "}
            </Text>
            <Text style={text}>Don&apos;t forget to Express That</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

MagicLinkEmail.PreviewProps = {
  verifyEmailUrl: "",
} as MagicLinkEmailProps;

export default MagicLinkEmail;

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
