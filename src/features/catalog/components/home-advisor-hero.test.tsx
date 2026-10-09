import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeAdvisorHero, type HomeAdvisorHeroMessages } from './home-advisor-hero';

const messages: HomeAdvisorHeroMessages = {
  badge: 'Asesor tech incluido en cada compra',
  title: 'La tecnología que buscas, explicada con pruebas',
  subtitle: 'Cuéntanos tu presupuesto y para qué la usarás.',
  cta: 'Ver productos disponibles',
};

describe('HomeAdvisorHero', () => {
  it('renders the slogan and links the CTA to the product listing', () => {
    render(<HomeAdvisorHero catalogHref="/es/productos" messages={messages} />);

    expect(
      screen.getByRole('heading', {
        name: 'La tecnología que buscas, explicada con pruebas',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ver productos disponibles')).toHaveAttribute('href', '/es/productos');
  });

  it('renders the niche photo as a decorative background', () => {
    render(<HomeAdvisorHero catalogHref="/es/productos" messages={messages} />);

    const photo = screen.getByRole('presentation', { hidden: true });
    expect(photo).toHaveAttribute('src', expect.stringContaining('images.unsplash.com'));
  });
});
