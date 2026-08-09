import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SentimentBadge } from './SentimentBadge';

describe('SentimentBadge', () => {
  it('renders positive sentiment correctly', () => {
    render(<SentimentBadge sentiment="positive" score={0.8} />);
    expect(screen.getByText('Positive')).toBeInTheDocument();
  });

  it('renders negative sentiment correctly', () => {
    render(<SentimentBadge sentiment="negative" score={0.9} />);
    expect(screen.getByText('Negative')).toBeInTheDocument();
  });

  it('renders neutral sentiment correctly', () => {
    render(<SentimentBadge sentiment="neutral" score={0.1} />);
    expect(screen.getByText('Neutral')).toBeInTheDocument();
  });
});
