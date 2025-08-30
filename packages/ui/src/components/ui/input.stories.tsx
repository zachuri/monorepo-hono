import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A flexible input component with various types and states.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'The type of input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password...',
  },
};

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'This input is disabled',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    value: 'Pre-filled value',
    placeholder: 'Enter text...',
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <Input placeholder="Default size" />
      <Input className="h-12 text-lg" placeholder="Large size" />
      <Input className="h-8 text-sm" placeholder="Small size" />
    </div>
  ),
};
