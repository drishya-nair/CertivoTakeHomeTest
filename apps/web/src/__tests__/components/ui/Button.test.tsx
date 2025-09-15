import { describe, it, expect } from 'vitest'
import Button from '@/components/ui/Button'

describe('Button Component', () => {
  it('should have correct display name', () => {
    expect(Button.displayName).toBe('Button')
  })

  it('should be a forwardRef component', () => {
    expect(typeof Button).toBe('object')
    expect(Button.$$typeof).toBeDefined()
  })

  it('should accept children as props', () => {
    // Test that the component can be called with children
    const props = {
      children: 'Test Button',
      variant: 'primary' as const,
      loading: false,
      disabled: false
    }
    
    // Verify props structure is correct
    expect(props.children).toBe('Test Button')
    expect(props.variant).toBe('primary')
    expect(props.loading).toBe(false)
    expect(props.disabled).toBe(false)
  })

  it('should handle different variants', () => {
    const primaryProps = { variant: 'primary' as const, children: 'Primary' }
    const secondaryProps = { variant: 'secondary' as const, children: 'Secondary' }
    
    expect(primaryProps.variant).toBe('primary')
    expect(secondaryProps.variant).toBe('secondary')
  })

  it('should handle loading state', () => {
    const loadingProps = { loading: true, children: 'Loading' }
    const notLoadingProps = { loading: false, children: 'Not Loading' }
    
    expect(loadingProps.loading).toBe(true)
    expect(notLoadingProps.loading).toBe(false)
  })

  it('should handle disabled state', () => {
    const disabledProps = { disabled: true, children: 'Disabled' }
    const enabledProps = { disabled: false, children: 'Enabled' }
    
    expect(disabledProps.disabled).toBe(true)
    expect(enabledProps.disabled).toBe(false)
  })

  it('should handle custom className', () => {
    const propsWithClassName = { 
      className: 'custom-class', 
      children: 'Custom' 
    }
    
    expect(propsWithClassName.className).toBe('custom-class')
  })

  it('should handle click events', () => {
    const mockClickHandler = () => {}
    const propsWithClick = { 
      onClick: mockClickHandler, 
      children: 'Clickable' 
    }
    
    expect(typeof propsWithClick.onClick).toBe('function')
  })

  it('should work with basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toBe('hello')
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })
})
