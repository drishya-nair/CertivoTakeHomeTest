// Frontend-specific types - independent of backend implementation
export interface BomPart {
  part_number: string;
  material: string;
  weight_g: number;
}

export interface BomData {
  bom_id: string;
  product_name: string;
  parts: BomPart[];
}

export interface ComplianceEntry {
  part_number: string;
  substance: string;
  threshold_ppm: number;
}

export interface MergedComponent {
  id: string;
  substance: string | null;
  mass: string;
  threshold_ppm: number | null;
  status: "Compliant" | "Non-Compliant" | "Unknown";
  material: string;
}

export interface MergedResponse {
  product: string;
  components: MergedComponent[];
}
