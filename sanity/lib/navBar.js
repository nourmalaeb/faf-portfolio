import { Box, Button, Card, Flex, useToast } from '@sanity/ui';
import './sanity-custom-navbar.css';
import { Rocket } from 'lucide-react';
import { useState } from 'react';

export function CustomNavbar(props) {
  const { renderDefault } = props;
  const toast = useToast();
  const deployHookUrl = process.env.NEXT_PUBLIC_DEPLOY_HOOK_URL;
  const [isDeploying, setIsDeploying] = useState(false);

  const deploySite = async () => {
    if (!deployHookUrl) {
      toast.push({
        status: 'error',
        title: 'Deployment failed',
        description:
          'No Vercel deploy hook found. Please check your environment variables.',
      });

      return;
    }
    try {
      const response = await fetch(deployHookUrl, { method: 'POST' });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      toast.push({
        status: 'success',
        title: 'Deployment Triggered',
        description:
          'Deployment has been triggered successfully. It may take a few minutes to complete.',
      });
    } catch (error) {
      console.error('Deployment failed:', error);
      toast.push({
        status: 'error',
        title: 'Deployment Failed',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    await deploySite();

    setTimeout(() => {
      setIsDeploying(false);
    }, 60000);
  };

  return (
    <Flex align={'center'}>
      <Box flex={1}>{renderDefault(props)}</Box>
      <Card
        style={{
          padding: '0 1em',
          borderBottom: '1px solid var(--card-border-color)',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `rgba(190, 190, 190, 0.1)`,
        }}
      >
        <button
          className="send-it-button"
          onClick={handleDeploy}
          disabled={isDeploying}
        >
          <Rocket size={14} />
          <span className="button-text">Send it</span>
        </button>
      </Card>
    </Flex>
  );
}
