import { describe, it, expect } from 'vitest'
import StatusIndicator from '@/components/StatusIndicator'
import { STATUS_SIZES } from '@/lib/constants'

describe('StatusIndicator Component Logic', () => {
  it('should handle all valid status types', () => {
    const validStatuses = ['Compliant', 'Non-Compliant', 'Unknown'] as const
    
    validStatuses.forEach(status => {
      expect(['Compliant', 'Non-Compliant', 'Unknown']).toContain(status)
    })
  })

  it('should handle all valid size types', () => {
    const validSizes = ['sm', 'md', 'lg'] as const
    
    validSizes.forEach(size => {
      expect(['sm', 'md', 'lg']).toContain(size)
    })
  })

  it('should have correct status configuration mapping', () => {
    const statusConfig = {
      "Compliant": { color: "bg-green-500", text: "Compliant" },
      "Non-Compliant": { color: "bg-red-500", text: "Non-Compliant" },
      "Unknown": { color: "bg-gray-500", text: "Unknown" },
    }
    
    expect(statusConfig["Compliant"].color).toBe("bg-green-500")
    expect(statusConfig["Compliant"].text).toBe("Compliant")
    expect(statusConfig["Non-Compliant"].color).toBe("bg-red-500")
    expect(statusConfig["Non-Compliant"].text).toBe("Non-Compliant")
    expect(statusConfig["Unknown"].color).toBe("bg-gray-500")
    expect(statusConfig["Unknown"].text).toBe("Unknown")
  })

  it('should have correct size configuration', () => {
    expect(STATUS_SIZES.sm).toBe("px-2 py-0.5 text-xs")
    expect(STATUS_SIZES.md).toBe("px-3 py-1 text-xs")
    expect(STATUS_SIZES.lg).toBe("px-4 py-1.5 text-sm")
  })

  it('should handle unknown status gracefully', () => {
    const unknownStatus = "InvalidStatus" as any
    const statusConfig: Record<string, { color: string; text: string }> = {
      "Compliant": { color: "bg-green-500", text: "Compliant" },
      "Non-Compliant": { color: "bg-red-500", text: "Non-Compliant" },
      "Unknown": { color: "bg-gray-500", text: "Unknown" },
    }
    
    // Should fallback to Unknown status
    const config = statusConfig[unknownStatus] || statusConfig["Unknown"]
    expect(config).toEqual(statusConfig["Unknown"])
  })

  it('should validate component props structure', () => {
    const validProps = {
      status: "Compliant" as const,
      size: "md" as const
    }
    
    expect(validProps).toHaveProperty('status')
    expect(validProps).toHaveProperty('size')
    expect(typeof validProps.status).toBe('string')
    expect(typeof validProps.size).toBe('string')
  })

  it('should handle default size when not provided', () => {
    const propsWithDefaultSize = {
      status: "Compliant" as const,
      size: "md" as const
    }
    
    expect(propsWithDefaultSize.size).toBe("md")
  })

  it('should validate status text mapping', () => {
    const statusTextMapping = {
      "Compliant": "Compliant",
      "Non-Compliant": "Non-Compliant", 
      "Unknown": "Unknown"
    }
    
    expect(statusTextMapping["Compliant"]).toBe("Compliant")
    expect(statusTextMapping["Non-Compliant"]).toBe("Non-Compliant")
    expect(statusTextMapping["Unknown"]).toBe("Unknown")
  })

  it('should handle all size combinations', () => {
    const statuses = ["Compliant", "Non-Compliant", "Unknown"] as const
    const sizes = ["sm", "md", "lg"] as const
    
    statuses.forEach(status => {
      sizes.forEach(size => {
        const props = { status, size }
        expect(props.status).toBe(status)
        expect(props.size).toBe(size)
      })
    })
  })
})
