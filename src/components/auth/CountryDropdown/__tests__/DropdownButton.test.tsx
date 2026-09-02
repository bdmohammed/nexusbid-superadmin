import { fireEvent, screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import DropdownButton from '../DropdownButton';

describe('DropdownButton', () => {
  it('renders placeholder text when no country is selected', () => {
    render(<DropdownButton displayText="Select Country" isOpen={false} setIsOpen={vi.fn()} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Select Country')).toBeInTheDocument();
  });

  it('renders selected country text', () => {
    render(<DropdownButton displayText="India" isOpen={false} setIsOpen={vi.fn()} />);

    expect(screen.getByText('India')).toBeInTheDocument();
  });

  it('sets correct accessibility attributes when closed', () => {
    render(<DropdownButton displayText="Select Country" isOpen={false} setIsOpen={vi.fn()} />);

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('sets correct accessibility attributes when open', () => {
    render(<DropdownButton displayText="India" isOpen setIsOpen={vi.fn()} />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens dropdown when currently closed', () => {
    const setIsOpen = vi.fn();

    render(<DropdownButton displayText="Select Country" isOpen={false} setIsOpen={setIsOpen} />);

    fireEvent.click(screen.getByRole('button'));

    expect(setIsOpen).toHaveBeenCalledTimes(1);
    expect(setIsOpen).toHaveBeenCalledWith(true);
  });

  it('closes dropdown when currently open', () => {
    const setIsOpen = vi.fn();

    render(<DropdownButton displayText="India" isOpen setIsOpen={setIsOpen} />);

    fireEvent.click(screen.getByRole('button'));

    expect(setIsOpen).toHaveBeenCalledTimes(1);
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('applies muted text styling for placeholder', () => {
    render(<DropdownButton displayText="Select Country" isOpen={false} setIsOpen={vi.fn()} />);

    expect(screen.getByText('Select Country')).toHaveClass('text-[var(--muted)]');
  });

  it('applies foreground styling for selected country', () => {
    render(<DropdownButton displayText="India" isOpen={false} setIsOpen={vi.fn()} />);

    expect(screen.getByText('India')).toHaveClass('text-[var(--foreground)]');
  });

  it('shows normal border when there is no error', () => {
    render(<DropdownButton displayText="India" isOpen={false} setIsOpen={vi.fn()} />);

    expect(screen.getByRole('button')).toHaveClass('border-[var(--border)]');
  });

  it('shows error border when error exists', () => {
    render(
      <DropdownButton
        displayText="India"
        isOpen={false}
        setIsOpen={vi.fn()}
        error="Country is required"
      />,
    );

    expect(screen.getByRole('button')).toHaveClass('border-red-500');
  });

  it('rotates chevron icon when dropdown is open', () => {
    const { container } = render(<DropdownButton displayText="India" isOpen setIsOpen={vi.fn()} />);

    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('rotate-180');
  });

  it('does not rotate chevron icon when dropdown is closed', () => {
    const { container } = render(
      <DropdownButton displayText="India" isOpen={false} setIsOpen={vi.fn()} />,
    );

    const svg = container.querySelector('svg');

    expect(svg).not.toHaveClass('rotate-180');
  });

  it('matches snapshot', () => {
    const { container } = render(
      <DropdownButton displayText="India" isOpen={false} setIsOpen={vi.fn()} />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
