import { BomData, ComplianceEntry, MergedComponent, MergedResponse } from "../types";

export function mergeBomAndCompliance(bom: BomData, compliance: ComplianceEntry[]): MergedResponse {
  // Normalize compliance entries by uppercase part number for fast lookup
  const complianceMap = new Map<string, ComplianceEntry>(
    compliance.map((entry) => [entry.part_number.trim().toUpperCase(), entry] as const)
  );

  const components: MergedComponent[] = bom.parts.map((part) => {
    const partId = part.part_number.trim();
    const entry = complianceMap.get(partId.toUpperCase());
    const massStr = `${part.weight_g}g`;

    if (!entry) {
      return {
        id: partId,
        substance: null,
        mass: massStr,
        threshold_ppm: null,
        status: "Unknown",
        material: part.material,
      };
    }

    // Demo assumption: BPA is allowed → Compliant; otherwise Non-Compliant
    const isCompliant = entry.substance.trim().toLowerCase() === "bpa";
    return {
      id: partId,
      substance: entry.substance,
      mass: massStr,
      threshold_ppm: entry.threshold_ppm,
      status: isCompliant ? "Compliant" : "Non-Compliant",
      material: part.material,
    };
  });

  return { product: bom.product_name, components };
}


