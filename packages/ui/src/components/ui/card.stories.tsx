import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A flexible card component with header, content, and footer sections.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area.</p>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button variant='outline'>Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className='w-[300px]'>
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
        <CardDescription>A basic card with just header and content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card shows a simple layout without footer.</p>
      </CardContent>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Card className='w-[300px]'>
      <CardContent className='p-6'>
        <p>This card only has content, no header or footer.</p>
      </CardContent>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card className='w-[400px]'>
      <CardHeader>
        <CardTitle>Featured Post</CardTitle>
        <CardDescription>An interesting article about technology</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='aspect-video bg-muted rounded-md mb-4' />
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.
        </p>
      </CardContent>
      <CardFooter>
        <Button className='w-full'>Read More</Button>
      </CardFooter>
    </Card>
  ),
};
