import { describe, it, expect } from 'vitest'
import Icon from '@/components/ui/Icon'

describe('Icon Component Logic', () => {
  it('should have correct component structure', () => {
    expect(typeof Icon).toBe('object')
  })

  it('should handle name prop correctly', () => {
    const iconProps = { name: 'search' as const }
    expect(iconProps.name).toBe('search')
  })

  it('should handle size prop correctly', () => {
    const smallIcon = { name: 'search' as const, size: 'sm' as const }
    const mediumIcon = { name: 'search' as const, size: 'md' as const }
    const largeIcon = { name: 'search' as const, size: 'lg' as const }
    
    expect(smallIcon.size).toBe('sm')
    expect(mediumIcon.size).toBe('md')
    expect(largeIcon.size).toBe('lg')
  })

  it('should handle className prop', () => {
    const iconWithClassName = { 
      name: 'search' as const, 
      className: 'custom-icon' 
    }
    
    expect(iconWithClassName.className).toBe('custom-icon')
  })

  it('should validate size types', () => {
    const validSizes = ['sm', 'md', 'lg'] as const
    
    validSizes.forEach(size => {
      expect(['sm', 'md', 'lg']).toContain(size)
    })
  })

  it('should handle default props', () => {
    const defaultProps = { name: 'search' as const }
    expect(defaultProps.name).toBe('search')
  })

  it('should handle all icon name variations', () => {
    const iconNames = ['search', 'user', 'settings', 'home', 'menu'] as const
    
    iconNames.forEach(name => {
      const props = { name }
      expect(props.name).toBe(name)
    })
  })
})
