import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlotForm } from './PlotForm';
import { Plot } from '@/types/farm';

const mockPlot: Plot = {
    id: '1',
    name: 'Talhão Teste',
    area: '50',
    city: 'Campinas',
    state: 'SP',
    registration: '654321',
    lot: 'Lote 2',
    status: 'Ativo',
};

describe('PlotForm', () => {
    const mockSetPlotForm = vi.fn();
    const mockOnSubmit = vi.fn((e) => e.preventDefault());
    const mockOnCancel = vi.fn();

    const renderCreateForm = () => {
        const emptyPlotData: Plot = {
            id: '', name: '', area: '0', city: '', state: '', registration: '', lot: '', status: 'Ativo'
        };

        return render(
            <PlotForm
                plotForm={emptyPlotData}
                setPlotForm={mockSetPlotForm}
                editingPlot={null}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );
    }
    
    const renderEditForm = () => {
        return render(
            <PlotForm
                plotForm={mockPlot}
                setPlotForm={mockSetPlotForm}
                editingPlot={mockPlot}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the form in create mode with a title and empty fields', () => {
        renderCreateForm();

        expect(screen.getByText('Adicionar Novo Talhão')).toBeInTheDocument();
        expect(screen.getByLabelText('Nome do Talhão')).toHaveValue('');
        expect(screen.getByLabelText('Área Total (ha)')).toHaveValue(0);
        expect(screen.getByLabelText('Cidade')).toHaveValue('');
        expect(screen.getByLabelText('Estado')).toHaveValue('');
        expect(screen.getByLabelText('Matrícula')).toHaveValue('');
        expect(screen.getByLabelText('Lote')).toHaveValue('');

        const addButton = screen.getByRole('button', { name: /Adicionar/i });
        expect(addButton).toBeInTheDocument();
    });

    it('renders the form in edit mode with a title and pre-filled data', () => {
        renderEditForm();

        expect(screen.getByText('Editar Talhão')).toBeInTheDocument();
        expect(screen.getByLabelText('Nome do Talhão')).toHaveValue(mockPlot.name);
        expect(screen.getByLabelText('Área Total (ha)')).toHaveValue(Number(mockPlot.area));
        expect(screen.getByLabelText('Cidade')).toHaveValue(mockPlot.city);
        expect(screen.getByLabelText('Estado')).toHaveValue(mockPlot.state);
        expect(screen.getByLabelText('Matrícula')).toHaveValue(mockPlot.registration);
        expect(screen.getByLabelText('Lote')).toHaveValue(mockPlot.lot);
        
        const updateButton = screen.getByRole('button', { name: /Atualizar/i });
        expect(updateButton).toBeInTheDocument();
    });
    
    it('calls setPlotForm when a field is changed', () => {
        const emptyPlotData: Plot = { id: '', name: '', area: '0', city: '', state: '', registration: '', lot: '', status: 'Ativo' };
        render(
            <PlotForm
                plotForm={emptyPlotData}
                setPlotForm={mockSetPlotForm}
                editingPlot={null}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );
        
        const plotNameInput = screen.getByLabelText('Nome do Talhão');
        fireEvent.change(plotNameInput, { target: { value: 'Novo Talhão' } });
        expect(mockSetPlotForm).toHaveBeenCalledWith({ ...emptyPlotData, name: 'Novo Talhão' });
    });

    it('calls onSubmit when the form is submitted', () => {
        renderEditForm();

        const form = screen.getByRole('button', { name: 'Atualizar' }).closest('form');
        fireEvent.submit(form!);
        expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('calls onCancel when the cancel button is clicked', () => {
        renderCreateForm();

        const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
        fireEvent.click(cancelButton);
        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('recalculates hectares when alqueires is entered', () => {
        renderCreateForm();

        const alqInput = screen.getByLabelText('Área Total (alq)');
        fireEvent.change(alqInput, { target: { value: '10' } });

        const haInput = screen.getByLabelText('Área Total (ha)');
        expect(haInput).toHaveValue(24.2);
        expect(mockSetPlotForm).toHaveBeenCalledWith(expect.objectContaining({ area: '24.20' }));
    });

    it('recalculates alqueires when hectares is entered', () => {
        renderCreateForm();

        const haInput = screen.getByLabelText('Área Total (ha)');
        fireEvent.change(haInput, { target: { value: '24.20' } });

        const alqInput = screen.getByLabelText('Área Total (alq)');
        expect(alqInput).toHaveValue(10);
    });
});
