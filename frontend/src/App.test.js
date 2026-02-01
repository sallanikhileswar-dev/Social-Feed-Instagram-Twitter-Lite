import { render, screen } from '@testing-library/react';
import App from './App';

test('renders social media app heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Social Media App/i);
  expect(headingElement).toBeInTheDocument();
});
