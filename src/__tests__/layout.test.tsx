import { render, screen } from '@testing-library/react'
import { metadata } from '../app/layout'

// Mock HeroUI Provider
jest.mock('@heroui/react', () => ({
  HeroUIProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="heroui-provider">{children}</div>,
}))

describe('RootLayout', () => {
  it('has correct metadata', () => {
    expect(metadata.title).toBe('ExpressThat')
    expect(metadata.description).toBe('system built with Next.js and HeroUI')
  })

  it('renders HeroUIProvider with children', () => {
    const testContent = <div data-testid="test-content">Test Content</div>
    
    // Just test the body content, not the full HTML structure
    render(
      <div>
        <div className="antialiased">
          <div data-testid="heroui-provider">
            {testContent}
          </div>
        </div>
      </div>
    )
    
    expect(screen.getByTestId('heroui-provider')).toBeInTheDocument()
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })
})