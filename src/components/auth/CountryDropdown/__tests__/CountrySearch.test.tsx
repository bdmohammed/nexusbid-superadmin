import { fireEvent, screen } from '@testing-library/react';
import { render } from '@tests/test-utils';
import { describe, expect, it, vi } from 'vitest';

import CountrySearch from '../CountrySearch';

describe('CountrySearch', () => {
  it('renders search input', () => {
    render(<CountrySearch value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('Search countries...')).toBeInTheDocument();
  });

  it('renders the provided value', () => {
    render(<CountrySearch value="India" onChange={vi.fn()} />);

    expect(screen.getByDisplayValue('India')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();

    render(<CountrySearch value="" onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText('Search countries...'), {
      target: { value: 'Canada' },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Canada');
  });

  it('calls onChange with an empty string when cleared', () => {
    const onChange = vi.fn();

    render(<CountrySearch value="India" onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText('Search countries...'), {
      target: { value: '' },
    });

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders a text input', () => {
    render(<CountrySearch value="" onChange={vi.fn()} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('has the correct placeholder', () => {
    render(<CountrySearch value="" onChange={vi.fn()} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Search countries...');
  });

  it('renders the search icon', () => {
    const { container } = render(<CountrySearch value="" onChange={vi.fn()} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<CountrySearch value="" onChange={vi.fn()} />);

    expect(container.firstChild).toMatchSnapshot();
  });
});
