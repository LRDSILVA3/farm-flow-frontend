import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FarmForm } from './FarmForm';
import { Farm } from '@/types/farm';

// Mock child components
vi.mock('./CustomerSelect', () => ({
    CustomerSelect: ({ value, onValueChange, customers }: any) => (
        <select value={value} onChange={(e) => onValueChange(e.target.value)}>
            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
    )
}));

vi.mock('./CityStateSelect', () => ({
    CityStateSelect: ({ city, state, onCityChange, onStateChange }: any) => (
        <>
            <input data-testid="city-select" value={city} onChange={(e) => onCityChange(e.target.value)} />
            <input data-testid="state-select" value={state} onChange={(e) => onStateChange(e.target.value)} />
        </>
    )
}));


const mockFarm: Farm = {
    id: '1',
    name: 'Fazenda Teste',
    owner: '1',
    area: '100',
    contact: '11999999999',
    city: 'São Paulo',
    state: 'SP',
    status: 'Ativo',
    lot: 'Lote 1',
    registration: '123456',
    plots: [],
};

describe('FarmForm', () => {
    const mockOnInputChange = vi.fn();
    const mockOnSubmit = vi.fn((e) => e.preventDefault());
    const mockOnCancel = vi.fn();

    const renderCreateForm = () => {
        const emptyFarmData: Farm = {
            id: '', name: '', owner: '', area: '0', contact: '', city: '', state: '', status: 'Ativo', lot: '', registration: '', plots: [],
        };

        return render(
            <FarmForm
                open={true}
                onOpenChange={() => {}}
                editingFarm={null}
                formData={emptyFarmData}
                onInputChange={mockOnInputChange}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );
    }
    
    const renderEditForm = () => {
        return render(
            <FarmForm
                open={true}
                onOpenChange={() => {}}
                editingFarm={mockFarm}
                formData={mockFarm}
                onInputChange={mockOnInputChange}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the form in create mode with empty fields', () => {
        renderCreateForm();

        expect(screen.getByText('Nova Fazenda')).toBeInTheDocument();
        expect(screen.getByLabelText('Nome da Fazenda')).toHaveValue('');
        expect(screen.getByLabelText('Área Total (ha)')).toHaveValue(0);
        expect(screen.getByLabelText('Contato')).toHaveValue('');
        expect(screen.getByTestId('city-select')).toHaveValue('');
        expect(screen.getByTestId('state-select')).toHaveValue('');
        expect(screen.getByLabelText('Lote')).toHaveValue('');
        expect(screen.getByLabelText('Matrícula')).toHaveValue('');

        const createButton = screen.getByRole('button', { name: /Criar/i });
        expect(createButton).toBeInTheDocument();
    });

    it('renders the form in edit mode with pre-filled data', () => {
        renderEditForm();

        expect(screen.getByText('Editar Fazenda')).toBeInTheDocument();
        expect(screen.getByLabelText('Nome da Fazenda')).toHaveValue(mockFarm.name);
        expect(screen.getByLabelText('Área Total (ha)')).toHaveValue(Number(mockFarm.area));
        expect(screen.getByLabelText<HTMLInputElement>('Contato')).toHaveValue('(11) 99999-9999');
        expect(screen.getByTestId('city-select')).toHaveValue(mockFarm.city);
        expect(screen.getByTestId('state-select')).toHaveValue(mockFarm.state);
        expect(screen.getByLabelText('Lote')).toHaveValue(mockFarm.lot);
        expect(screen.getByLabelText('Matrícula')).toHaveValue(mockFarm.registration);
        
        const updateButton = screen.getByRole('button', { name: /Atualizar/i });
        expect(updateButton).toBeInTheDocument();
    });
    
    it('calls onInputChange when a field is changed', () => {
        renderCreateForm();
        
        const farmNameInput = screen.getByLabelText('Nome da Fazenda');
        fireEvent.change(farmNameInput, { target: { value: 'Nova Fazenda' } });
        expect(mockOnInputChange).toHaveBeenCalledWith('name', 'Nova Fazenda');
    });

    it('calls onSubmit when the form is submitted', () => {
        renderCreateForm();

        const form = screen.getByRole('form');
        fireEvent.submit(form);
        expect(mockOnSubmit).toHaveBeenCalled();
    });



    it('calls onCancel when the cancel button is clicked', () => {
        renderCreateForm();

        const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
        fireEvent.click(cancelButton);
        expect(mockOnCancel).toHaveBeenCalled();
    });
});
