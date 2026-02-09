import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomersPage from './CustomersPage';
import { MemoryRouter } from 'react-router-dom';
import * as useClients from '@/hooks/useClients';

// Mock the useClients hook
vi.mock('@/hooks/useClients');

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockUseClients = {
  clients: [],
  editingClient: null,
  addClient: vi.fn(),
  updateClient: vi.fn(),
  startEditing: vi.fn(),
  stopEditing: vi.fn(),
};

describe('CustomersPage', () => {
  it('renders the customers page, opens the form, and submits a new client', () => {
    (useClients as any).useClients.mockReturnValue(mockUseClients);

    render(
      <MemoryRouter>
        <CustomersPage onNavigateToFarms={() => {}} />
      </MemoryRouter>
    );

    // Check for the main heading
    expect(screen.getByRole('heading', { level: 1, name: /Clientes/i })).toBeInTheDocument();
    expect(screen.getByText(/Gerencie os clientes da empresa/i)).toBeInTheDocument();

    // Click the "Novo Cliente" button
    const newCustomerButton = screen.getByText(/Novo Cliente/i);
    expect(newCustomerButton).toBeInTheDocument();
    fireEvent.click(newCustomerButton);

    // Check if the form is displayed
    expect(screen.getByRole('heading', { name: /Novo Client/i })).toBeInTheDocument();

    // Fill out the form
    fireEvent.input(screen.getByLabelText(/CPF/i), { target: { value: '12345678900' } });
    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), { target: { value: '1990-01-01' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.input(screen.getByLabelText(/Telefone/i), { target: { value: '11999999999' } });
    fireEvent.input(screen.getByLabelText(/CEP/i), { target: { value: '01234567' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Cadastrar/i });
    fireEvent.click(submitButton);

    // Check if the addClient function was called with the correct data
    expect(mockUseClients.addClient).toHaveBeenCalledWith({
      cpf: '123.456.789-00',
      name: 'John Doe',
      birthDate: '1990-01-01',
      email: 'john.doe@example.com',
      phone: '(11) 99999-9999',
      zipCode: '01234-567',
      city: '',
      state: '',
      cadPro: '',
    });
  });

  it('renders the customers page, opens the form for editing, and submits updated client', () => {
    const mockClient = {
      id: '1',
      cpf: '123.456.789-00',
      name: 'John Doe',
      birthDate: '1990-01-01',
      email: 'john.doe@example.com',
      phone: '(11) 99999-9999',
      zipCode: '01234-567',
      city: 'Some City',
      state: 'Some State',
      cadPro: '',
    };

    let editingClient: any = null;

    const useClientsMock = {
      clients: [mockClient],
      get editingClient() {
        return editingClient;
      },
      addClient: vi.fn(),
      updateClient: vi.fn(),
      startEditing: vi.fn((client) => {
        editingClient = client;
      }),
      stopEditing: vi.fn(() => {
        editingClient = null;
      }),
    };

    (useClients as any).useClients.mockReturnValue(useClientsMock);

    const { rerender } = render(
      <MemoryRouter>
        <CustomersPage onNavigateToFarms={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();

    const editButton = screen.getByTitle('Editar cliente');
    fireEvent.click(editButton);

    rerender(
        <MemoryRouter>
            <CustomersPage onNavigateToFarms={() => {}} />
        </MemoryRouter>
    );
    
    expect(useClientsMock.startEditing).toHaveBeenCalledWith(mockClient);

    expect(screen.getByRole('heading', { name: /Editar Client/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/CPF/i)).toHaveValue(mockClient.cpf);
    expect(screen.getByLabelText(/Nome/i)).toHaveValue(mockClient.name);
    
    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'John Doe Updated' } });

    const submitButton = screen.getByRole('button', { name: /Atualizar/i });
    fireEvent.click(submitButton);

    expect(useClientsMock.updateClient).toHaveBeenCalledWith(
        expect.objectContaining({
            name: 'John Doe Updated',
        })
    );
  });
});
