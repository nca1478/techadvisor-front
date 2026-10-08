import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeAdvisorHero, type HomeAdvisorHeroMessages } from './home-advisor-hero';

const messages: HomeAdvisorHeroMessages = {
  badge: 'Asesor · ejemplo',
  title: 'Pregunta como comprarías, responde con fuentes',
  question: '¿Portátil para ingeniería hasta 800 USD con 16 GB de RAM?',
  answerIntro: 'Ejemplo con productos reales del catálogo:',
  citationLabel: 'Fuente',
  disclaimer: 'Vista previa del asesor.',
  trySearch: 'Probar esta búsqueda',
  picksLabel: 'Selección del asesor',
  emptyPicks: 'Aún no hay destacados para mostrar como ejemplo.',
};

describe('HomeAdvisorHero', () => {
  it('renders real picks with citation markers and links to existing routes', () => {
    render(
      <HomeAdvisorHero
        locale="es"
        searchHref="/es/buscar?q=portatil"
        picks={[{ id: '1', slug: 'laptop-x', name: 'Laptop X' }]}
        detailHrefFor={(slug) => `/es/productos/${slug}`}
        messages={messages}
      />,
    );

    expect(screen.getByText('Laptop X')).toHaveAttribute('href', '/es/productos/laptop-x');
    expect(screen.getByText(/\[1\] Fuente/)).toBeInTheDocument();
    expect(screen.getByText('Probar esta búsqueda')).toHaveAttribute(
      'href',
      '/es/buscar?q=portatil',
    );
  });

  it('shows an invitation to act when there are no picks', () => {
    render(
      <HomeAdvisorHero
        locale="es"
        searchHref="/es/buscar?q=portatil"
        picks={[]}
        detailHrefFor={(slug) => `/es/productos/${slug}`}
        messages={messages}
      />,
    );

    expect(
      screen.getByText('Aún no hay destacados para mostrar como ejemplo.'),
    ).toBeInTheDocument();
  });
});
