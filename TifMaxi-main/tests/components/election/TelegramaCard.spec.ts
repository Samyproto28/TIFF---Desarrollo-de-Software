import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TelegramaCard from '@/components/election/TelegramaCard.vue';

// Mock the types
interface Telegrama {
  id: number;
  id_mesa: string;
  provincia_id: number;
  provincia?: { id: number; nombre: string };
  circuito_escuela: string;
  total_electores: number;
  total_votos: number;
  votos_blanco: number;
  votos_nulos: number;
  votos_impugnados: number;
  estado: 'pendiente' | 'validado' | 'rechazado';
  fecha_carga: string;
  candidatos?: Array<{
    id: number;
    nombre_completo: string;
    cargo: 'Diputado' | 'Senador';
    pivot: {
      votos: number;
    };
  }>;
}

describe('TelegramaCard', () => {
  const mockTelegrama: Telegrama = {
    id: 1,
    id_mesa: 'MESA001',
    provincia_id: 1,
    provincia: { id: 1, nombre: 'Buenos Aires' },
    circuito_escuela: 'Escuela Primaria N° 123',
    total_electores: 100,
    total_votos: 80,
    votos_blanco: 5,
    votos_nulos: 3,
    votos_impugnados: 2,
    estado: 'pendiente',
    fecha_carga: '2023-01-01T12:00:00Z',
    candidatos: [
      {
        id: 1,
        nombre_completo: 'Juan Pérez',
        cargo: 'Diputado',
        pivot: { votos: 35 },
      },
      {
        id: 2,
        nombre_completo: 'María García',
        cargo: 'Senador',
        pivot: { votos: 35 },
      },
    ],
  };

  it('renders telegrama information correctly', () => {
    const wrapper = mount(TelegramaCard, {
      props: { telegrama: mockTelegrama },
    });

    expect(wrapper.text()).toContain('MESA001');
    expect(wrapper.text()).toContain('Buenos Aires');
    expect(wrapper.text()).toContain('Escuela Primaria N° 123');
    expect(wrapper.text()).toContain('80');
  });

  it('calculates participation percentage correctly', () => {
    const wrapper = mount(TelegramaCard, {
      props: { telegrama: mockTelegrama },
    });

    // 80 votes out of 100 electors = 80%
    expect(wrapper.text()).toContain('80%');
  });

  it('displays correct status badge based on estado', () => {
    // Test pendiente state
    const wrapperPendiente = mount(TelegramaCard, {
      props: { telegrama: { ...mockTelegrama, estado: 'pendiente' } },
    });
    expect(wrapperPendiente.find('[data-testid="badge"]').text()).toContain('pendiente');

    // Test validado state
    const wrapperValidado = mount(TelegramaCard, {
      props: { telegrama: { ...mockTelegrama, estado: 'validado' } },
    });
    expect(wrapperValidado.find('[data-testid="badge"]').text()).toContain('validado');

    // Test rechazado state
    const wrapperRechazado = mount(TelegramaCard, {
      props: { telegrama: { ...mockTelegrama, estado: 'rechazado' } },
    });
    expect(wrapperRechazado.find('[data-testid="badge"]').text()).toContain('rechazado');
  });

  it('shows appropriate action buttons based on estado', async () => {
    // Test pendiente state (should show all buttons)
    const wrapperPendiente = mount(TelegramaCard, {
      props: { telegrama: { ...mockTelegrama, estado: 'pendiente' } },
    });
    await wrapperPendiente.vm.$nextTick();
    
    expect(wrapperPendiente.find('[data-testid="btn-view"]').exists()).toBe(true);
    expect(wrapperPendiente.find('[data-testid="btn-edit"]').exists()).toBe(true);
    expect(wrapperPendiente.find('[data-testid="btn-validate"]').exists()).toBe(true);
    expect(wrapperPendiente.find('[data-testid="btn-reject"]').exists()).toBe(true);

    // Test validado state (should not show edit, validate, reject buttons)
    const wrapperValidado = mount(TelegramaCard, {
      props: { telegrama: { ...mockTelegrama, estado: 'validado' } },
    });
    await wrapperValidado.vm.$nextTick();
    
    expect(wrapperValidado.find('[data-testid="btn-view"]').exists()).toBe(true);
    expect(wrapperValidado.find('[data-testid="btn-edit"]').exists()).toBe(false);
    expect(wrapperValidado.find('[data-testid="btn-validate"]').exists()).toBe(false);
    expect(wrapperValidado.find('[data-testid="btn-reject"]').exists()).toBe(false);

    // Test rechazado state (should show view and edit buttons)
    const wrapperRechazado = mount(TelegramaCard, {
      props: { telegrama: { ...mockTelegrama, estado: 'rechazado' } },
    });
    await wrapperRechazado.vm.$nextTick();
    
    expect(wrapperRechazado.find('[data-testid="btn-view"]').exists()).toBe(true);
    expect(wrapperRechazado.find('[data-testid="btn-edit"]').exists()).toBe(true);
    expect(wrapperRechazado.find('[data-testid="btn-validate"]').exists()).toBe(false);
    expect(wrapperRechazado.find('[data-testid="btn-reject"]').exists()).toBe(false);
  });

  it('emits correct events when action buttons are clicked', async () => {
    const wrapper = mount(TelegramaCard, {
      props: { telegrama: mockTelegrama },
    });

    // Test view button
    await wrapper.find('[data-testid="btn-view"]').trigger('click');
    expect(wrapper.emitted('view')).toBeTruthy();
    expect(wrapper.emitted('view')?.[0]).toEqual([mockTelegrama]);

    // Test edit button
    await wrapper.find('[data-testid="btn-edit"]').trigger('click');
    expect(wrapper.emitted('edit')).toBeTruthy();
    expect(wrapper.emitted('edit')?.[0]).toEqual([mockTelegrama]);

    // Test validate button
    await wrapper.find('[data-testid="btn-validate"]').trigger('click');
    expect(wrapper.emitted('validate')).toBeTruthy();
    expect(wrapper.emitted('validate')?.[0]).toEqual([mockTelegrama]);

    // Test reject button
    await wrapper.find('[data-testid="btn-reject"]').trigger('click');
    expect(wrapper.emitted('reject')).toBeTruthy();
    expect(wrapper.emitted('reject')?.[0]).toEqual([mockTelegrama]);
  });

  it('applies correct border color based on estado', () => {
    // Test pendiente state
    const wrapperPendiente = mount(TelegramaCard, {
      props: { telegrama: { ...mockTelegrama, estado: 'pendiente' } },
    });
    expect(wrapperPendiente.classes()).toContain('border-l-4');
    expect(wrapperPendiente.classes()).toContain('border-yellow-500');

    // Test validado state
    const wrapperValidado = mount(TelegramaCard, {
      props: { telegrama: { ...mockTelegrama, estado: 'validado' } },
    });
    expect(wrapperValidado.classes()).toContain('border-l-4');
    expect(wrapperValidado.classes()).toContain('border-green-500');

    // Test rechazado state
    const wrapperRechazado = mount(TelegramaCard, {
      props: { telegrama: { ...mockTelegrama, estado: 'rechazado' } },
    });
    expect(wrapperRechazado.classes()).toContain('border-l-4');
    expect(wrapperRechazado.classes()).toContain('border-red-500');
  });

  it('handles compact mode correctly', () => {
    const wrapper = mount(TelegramaCard, {
      props: { telegrama: mockTelegrama, compact: true },
    });

    // In compact mode, it should not have the border color
    expect(wrapper.classes()).not.toContain('border-l-4');
  });

  it('handles missing provincia information gracefully', () => {
    const telegramaWithoutProvincia = {
      ...mockTelegrama,
      provincia: undefined,
      provincia_id: 999,
    };

    const wrapper = mount(TelegramaCard, {
      props: { telegrama: telegramaWithoutProvincia },
    });

    expect(wrapper.text()).toContain('MESA001');
    // Should not show provincia name since it's missing
    expect(wrapper.text()).not.toContain('Buenos Aires');
  });

  it('formats date correctly', () => {
    const wrapper = mount(TelegramaCard, {
      props: { telegrama: mockTelegrama },
    });

    // Check that date is formatted (implementation depends on formatDate function)
    expect(wrapper.text()).toContain('1/1/2023');
  });
});