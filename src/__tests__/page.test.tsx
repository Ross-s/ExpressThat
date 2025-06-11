import { render, screen } from '@testing-library/react'
import Home from '../app/page'
import '@testing-library/jest-dom'

// Mock HeroUI components
jest.mock('@heroui/react', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => <button {...props}>{children}</button>,
  Card: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => <div {...props}>{children}</div>,
  CardBody: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => <div {...props}>{children}</div>,
}))

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', {
      name: /expressthat/i,
    })
    
    expect(heading).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<Home />)
    
    const description = screen.getByText(/a modern system built with next\.js, typescript, tailwind css, and heroui/i)
    
    expect(description).toBeInTheDocument()
  })

  it('renders the feature cards', () => {
    render(<Home />)
    
    expect(screen.getByText('Next.js 15')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('HeroUI')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<Home />)
    
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument()
  })
})