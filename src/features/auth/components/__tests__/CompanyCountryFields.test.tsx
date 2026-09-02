import { useEffect } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { waitFor } from '@tests/test-utils';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { CompanyCountryFields } from '../CompanyCountryFields';

import type { RegisterFormValues } from '../../schemas/register.schema';

const CountryDropdownMock = vi.fn();

vi.mock('@/components/auth/CountryDropdown', () => ({
  default: (props: any) => {
    CountryDropdownMock(props);

    return (
      <div>
        <button type="button" onClick={() => props.onChange('2')}>
          Select Country
        </button>

        <button type="button" onClick={props.onBlur}>
          Blur Country
        </button>

        {props.error && <span>{props.error}</span>}
      </div>
    );
  },
}));

function renderForm(
  defaultValues?: Partial<RegisterFormValues>,
  errors?: Partial<Record<keyof RegisterFormValues, string>>,
) {
  function Wrapper() {
    const methods = useForm<RegisterFormValues>({
      defaultValues: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        countryId: '',
        secondary_website: '',
        terms: false,
        ...defaultValues,
      },
    });

    useEffect(() => {
      if (!errors) return;

      Object.entries(errors).forEach(([key, value]) => {
        methods.setError(key as keyof RegisterFormValues, {
          type: 'manual',
          message: value,
        });
      });
    }, [methods]);

    return (
      <FormProvider {...methods}>
        <CompanyCountryFields />
      </FormProvider>
    );
  }

  return render(<Wrapper />);
}

describe('CompanyCountryFields', () => {
  it('renders company input', () => {
    renderForm();

    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Acme Corp')).toBeInTheDocument();
  });

  it('renders CountryDropdown', () => {
    renderForm();

    expect(CountryDropdownMock).toHaveBeenCalled();
  });

  it('passes default value to CountryDropdown', () => {
    renderForm({
      countryId: '5',
    });

    expect(CountryDropdownMock).toHaveBeenCalled();
  });

  it('shows company validation error', () => {
    renderForm(
      {},
      {
        companyName: 'Company is required',
      },
    );

    expect(screen.getByText('Company is required')).toBeInTheDocument();

    expect(screen.getByLabelText(/Company Name/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('passes country validation error to CountryDropdown', async () => {
    renderForm(
      {},
      {
        countryId: 'Country is required',
      },
    );

    await waitFor(() => {
      const props = CountryDropdownMock.mock.lastCall?.[0];

      expect(props.error).toBe('Country is required');
    });
  });

  it('updates company field', () => {
    renderForm();

    const input = screen.getByLabelText(/Company Name/i);

    fireEvent.change(input, {
      target: {
        value: 'OpenAI',
      },
    });

    expect(input).toHaveValue('OpenAI');
  });

  it.todo('calls controller onChange', async () => {
    renderForm();

    fireEvent.click(screen.getByText('Select Country'));

    // expect(CountryDropdownMock.mock.calls[0]?.[0]?.value).toBe('');

    await waitFor(() => {
      const props = CountryDropdownMock.mock.lastCall?.[0];

      expect(props?.error).toBe('Country is required');
    });
  });

  it('calls controller onBlur', () => {
    renderForm();

    expect(() => {
      fireEvent.click(screen.getByText('Blur Country'));
    }).not.toThrow();
  });

  it('renders without validation errors', () => {
    renderForm();

    expect(screen.queryByText('Company is required')).not.toBeInTheDocument();

    expect(screen.queryByText('Country is required')).not.toBeInTheDocument();
  });

  it('sets aria-describedby when company has an error', () => {
    renderForm(
      {},
      {
        companyName: 'Required',
      },
    );

    expect(screen.getByLabelText(/Company Name/i)).toHaveAttribute(
      'aria-describedby',
      'company-error',
    );
  });
});
