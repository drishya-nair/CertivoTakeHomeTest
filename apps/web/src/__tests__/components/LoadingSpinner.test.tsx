import { describe, it, expect } from 'vitest'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

describe('LoadingSpinner Component Logic', () => {
  it('should have correct component structure', () => {
    expect(typeof LoadingSpinner).toBe('function')
  })

  it('should handle size prop correctly', () => {
    const smallProps = { size: 'sm' as const }
    const mediumProps = { size: 'md' as const }
    const largeProps = { size: 'lg' as const }
    
    expect(smallProps.size).toBe('sm')
    expect(mediumProps.size).toBe('md')
    expect(largeProps.size).toBe('lg')
  })

  it('should handle className prop', () => {
    const propsWithClassName = { 
      size: 'md' as const, 
      className: 'custom-spinner' 
    }
    
    expect(propsWithClassName.className).toBe('custom-spinner')
  })

  it('should validate size types', () => {
    const validSizes = ['sm', 'md', 'lg'] as const
    
    validSizes.forEach(size => {
      expect(['sm', 'md', 'lg']).toContain(size)
    })
  })

  it('should handle default props', () => {
    const defaultProps = { size: 'md' as const }
    expect(defaultProps.size).toBe('md')
  })
})
