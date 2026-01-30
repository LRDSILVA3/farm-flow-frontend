import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FarmsPage from './FarmPage';
import { MemoryRouter } from 'react-router-dom';
import * as useFarms from '@/hooks/useFarms';

vi.mock('@/hooks/useFarms');
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
      toast: vi.fn(),
    }),
}));

// Mock FarmForm component
const MockFarmForm = vi.fn(() => null);
vi.mock('./farms/FarmForm', () => ({
    FarmForm: MockFarmForm,
}));

let mockShowFarmForm = false;
let mockFormData = {
    id: '',
    name: '',
    owner: '',
    area: '0',
    contact: '',
    city: '',
    state: '',
    status: 'Ativo',
    lot: '',
    registration: '',
    plots: [],
};

const mockUseFarms = {
  farms: [],
  setFarms: vi.fn(),
  get showFarmForm() {
    return mockShowFarmForm;
  },
  setShowFarmForm: vi.fn((show) => {
    mockShowFarmForm = show;
  }),
  editingFarm: null,
  setEditingFarm: vi.fn(),
  showPlotsModal: false,
  setShowPlotsModal: vi.fn(),
  selectedFarm: null,
  setSelectedFarm: vi.fn(),
  get formData() {
    return mockFormData;
  },
  setFormData: vi.fn((data) => {
    if (typeof data === 'function') {
        mockFormData = data(mockFormData);
    } else {
        mockFormData = data;
    }
  }),
  plotForm: { id: '', name: '', area: '0', city: '', state: '', registration: '', lot: '', status: 'Ativo' },
  setPlotForm: vi.fn(),
  addFarm: vi.fn(),
  updateFarm: vi.fn(),
  addPlot: vi.fn(),
  deletePlot: vi.fn(),
  currentPage: 1,
  setCurrentPage: vi.fn(),
  itemsPerPage: 10,
  setItemsPerPage: vi.fn(),
};

describe('FarmsPage', () => {
    beforeEach(() => {
        mockShowFarmForm = false;
        mockFormData = {
            id: '', name: '', owner: '', area: '0', contact: '', city: '', state: '', status: 'Ativo', lot: '', registration: '', plots: [],
        };
        vi.clearAllMocks();
        MockFarmForm.mockClear(); // Clear mock calls for FarmForm
    });

  it('renders the farms page and opens the new farm dialog', () => {
    (useFarms as any).useFarms.mockReturnValue(mockUseFarms);

    const { rerender } = render(<MemoryRouter><FarmsPage /></MemoryRouter>);

    expect(screen.getByRole('heading', { level: 1, name: /Fazendas/i })).toBeInTheDocument();
    
    const newFarmButton = screen.getByText('Nova Fazenda');
    fireEvent.click(newFarmButton);

    expect(mockUseFarms.setShowFarmForm).toHaveBeenCalledWith(true);

    // Manually update the state and rerender to show the form (as it's a modal)
    mockShowFarmForm = true;
    rerender(<MemoryRouter><FarmsPage /></MemoryRouter>);
    
    // Now check if MockFarmForm was rendered and received the correct props
    expect(MockFarmForm).toHaveBeenCalledWith(expect.objectContaining({
        open: true,
        editingFarm: null,
    }), {});
  });

  it('calls addFarm when the new farm form is submitted', async () => {
    // Configure useFarms mock to simulate form open and addFarm function
    mockShowFarmForm = true;
    const mockedAddFarm = vi.fn(() => Promise.resolve());
    const mockedUpdateFarm = vi.fn(() => Promise.resolve());
    (useFarms as any).useFarms.mockReturnValue({
        ...mockUseFarms,
        showFarmForm: true, // Ensure the form is open
        addFarm: mockedAddFarm,
        updateFarm: mockedUpdateFarm,
    });

    render(<MemoryRouter><FarmsPage /></MemoryRouter>);

    // Ensure FarmForm is rendered
    expect(MockFarmForm).toHaveBeenCalled();

    // Get the props passed to MockFarmForm
    const mockCalls = MockFarmForm.mock.calls as unknown as Array<[{ onSubmit: (e: { preventDefault: () => void }) => Promise<void> }]>;
    if (mockCalls.length > 0) {
      const farmFormProps = mockCalls[0][0];
      // Simulate form submission
      const mockEvent = { preventDefault: vi.fn() };
      await farmFormProps.onSubmit(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockedAddFarm).toHaveBeenCalledWith(expect.objectContaining({
          name: '', // Initial formData name
      }));
    }
  });
});
