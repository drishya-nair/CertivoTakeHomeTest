import { BomData, ComplianceEntry, MergedComponent, MergedResponse } from "@certivo/shared-types";
import HttpError from "../lib/httpError";

export function mergeBomAndCompliance(bom: BomData, compliance: ComplianceEntry[]): MergedResponse {
  // Validate input data
  if (!bom || !bom.parts || !Array.isArray(bom.parts)) {
    throw new HttpError(422, "Invalid BOM data structure");
  }
  
  if (!compliance || !Array.isArray(compliance)) {
    throw new HttpError(422, "Invalid compliance data structure");
  }
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

  if (components.length === 0) {
    throw new HttpError(404, "No components found after merging data");
  }

  return { product: bom.product_name, components };
}
