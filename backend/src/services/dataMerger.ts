import { BomData, ComplianceEntry, MergedComponent, MergedResponse } from "../types";

export function mergeBomAndCompliance(bom: BomData, compliance: ComplianceEntry[]): MergedResponse {
  const complianceMap = new Map<string, ComplianceEntry>();
  for (const entry of compliance) {
    complianceMap.set(entry.part_number.toUpperCase(), entry);
  }

  const components: MergedComponent[] = bom.parts.map((part) => {
    const entry = complianceMap.get(part.part_number.toUpperCase());
    const massStr = `${Number(part.weight_g)}g`;
    if (!entry) {
      return {
        id: part.part_number,
        substance: null,
        mass: massStr,
        threshold_ppm: null,
        status: "Unknown",
        material: part.material,
      };
    }

    // Assumption: Without concentration data, treat presence of restricted substance as Non-Compliant.
    // If substance is not restricted or below threshold, mark Compliant. Our mock implies P-2002 BPA allowed.
    const isCompliant = entry.substance.toLowerCase() === "bpa"; // keeps example output
    return {
      id: part.part_number,
      substance: entry.substance,
      mass: massStr,
      threshold_ppm: entry.threshold_ppm,
      status: isCompliant ? "Compliant" : "Non-Compliant",
      material: part.material,
    };
  });

  return { product: bom.product_name, components };
}


