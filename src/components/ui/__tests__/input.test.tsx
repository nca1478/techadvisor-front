import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../input';

describe('Input', () => {
  it('links the visible label to the field', () => {
    render(<Input label="Email" name="email" placeholder="you@example.com" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('placeholder', 'you@example.com');
  });

  it('announces errors and links them to the field', () => {
    render(<Input label="Email" name="email" error="Enter a valid email." />);
    const field = screen.getByLabelText('Email');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAttribute('aria-describedby', 'email-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email.');
  });

  it('shows hint text linked to the field when there is no error', () => {
    render(<Input label="Email" name="email" hint="We never share your email." />);
    expect(screen.getByText('We never share your email.')).toHaveAttribute('id', 'email-hint');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-describedby', 'email-hint');
  });

  it('uses the 40px touch target by default', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText('Email')).toHaveClass('h-10');
  });
});
