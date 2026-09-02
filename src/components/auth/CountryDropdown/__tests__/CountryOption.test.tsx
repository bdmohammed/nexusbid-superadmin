import { screen } from '@testing-library/react';
import { fireEvent, render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import CountryOption from '../CountryOption';

describe('CountryOption', () => {
  it('renders the country name', () => {
    render(<CountryOption countryId="1" countryName="India" selectedId="" onClick={vi.fn()} />);

    expect(screen.getByRole('option')).toHaveTextContent('India');
  });

  it('calls onClick with string country id when clicked', () => {
    const onClick = vi.fn();

    render(<CountryOption countryId="1" countryName="India" selectedId="" onClick={onClick} />);

    fireEvent.click(screen.getByRole('option'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith('1');
  });

  it('calls onClick with numeric country id when clicked', () => {
    const onClick = vi.fn();

    render(<CountryOption countryId={91} countryName="India" selectedId="" onClick={onClick} />);

    fireEvent.click(screen.getByRole('option'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(91);
  });

  it('marks option as selected when ids match', () => {
    render(<CountryOption countryId="1" countryName="India" selectedId="1" onClick={vi.fn()} />);

    const option = screen.getByRole('option');

    expect(option).toHaveAttribute('aria-selected', 'true');
    expect(option).toHaveClass('bg-[#003EC7]/10', 'text-[#003EC7]', 'font-semibold');
  });

  it('marks option as selected when string and number ids are equal', () => {
    render(<CountryOption countryId={1} countryName="India" selectedId="1" onClick={vi.fn()} />);

    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
  });

  it('marks option as not selected when ids differ', () => {
    render(<CountryOption countryId="2" countryName="Canada" selectedId="1" onClick={vi.fn()} />);

    const option = screen.getByRole('option');

    expect(option).toHaveAttribute('aria-selected', 'false');
    expect(option).toHaveClass('text-[var(--foreground)]');
    expect(option).not.toHaveClass('font-semibold');
  });

  it('renders as a button with type="button"', () => {
    render(<CountryOption countryId="1" countryName="India" selectedId="" onClick={vi.fn()} />);

    expect(screen.getByRole('option')).toHaveAttribute('type', 'button');
  });

  it('has role="option" for accessibility', () => {
    render(<CountryOption countryId="1" countryName="India" selectedId="" onClick={vi.fn()} />);

    expect(screen.getByRole('option')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <CountryOption countryId="1" countryName="India" selectedId="1" onClick={vi.fn()} />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
