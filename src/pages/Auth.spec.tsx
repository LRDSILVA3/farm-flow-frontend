import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Auth from './Auth';
import * as useAuthHook from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('Auth', () => {
  it('renders login form without any registration button or tab', () => {
    (useAuthHook as any).useAuth.mockReturnValue({
      signIn: vi.fn(),
    });

    render(<Auth onAuthSuccess={vi.fn()} />);

    // Assert that login fields and button are rendered
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();

    // Assert that registration tab / button does not exist
    expect(screen.queryByRole('button', { name: /Cadastrar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Cadastro/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Cadastro/i)).not.toBeInTheDocument();
  });

  it('calls signIn on login form submit with valid credentials', async () => {
    const signInMock = vi.fn().mockResolvedValue({ data: {}, error: null });
    const onAuthSuccessMock = vi.fn();

    (useAuthHook as any).useAuth.mockReturnValue({
      signIn: signInMock,
    });

    render(<Auth onAuthSuccess={onAuthSuccessMock} />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Senha/i), {
      target: { value: 'password123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));
    });

    expect(signInMock).toHaveBeenCalledWith('user@example.com', 'password123');
  });
});
