import catalog from "../data/cabinets.json";

export const CONTRACTOR_DISCOUNT = 0.2;

export type CabinetOption = {
  sku: string;
  display_name: string;
  name: string;
  unit: string;
  cost_per_unit: number | null;
  cost_by_finish?: Record<string, number>;
};

type Catalog = {
  display_name: string;
  finish_options: string[];
  msrp_source?: string;
  groups: Record<string, { display_name: string; options: CabinetOption[] }>;
};

const data = catalog as Catalog;

export function cabinetCatalog() {
  return data;
}

export function listPrice(option: CabinetOption, finish: string) {
  const byFinish = option.cost_by_finish?.[finish];
  const fallback = option.cost_per_unit;
  const value = typeof byFinish === "number" ? byFinish : fallback;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function contractorPrice(option: CabinetOption, finish: string) {
  const list = listPrice(option, finish);
  if (list == null) return null;
  return Math.round(list * (1 - CONTRACTOR_DISCOUNT) * 100) / 100;
}

export function flattenSkus() {
  return Object.entries(data.groups).flatMap(([groupId, group]) =>
    group.options.map((option) => ({
      groupId,
      groupName: group.display_name,
      sku: option.sku,
      name: option.display_name || option.name,
      option,
    })),
  );
}

export const COOKIE_NAME = "sbd_contractor";
export const EMPLOYEE_COOKIE = "sbd_employee";

export function pinFromRuntime() {
  const config = useRuntimeConfig();
  return String(config.contractorPin || "420420");
}

export function employeePinFromRuntime() {
  return String(useRuntimeConfig().employeePin || pinFromRuntime()).trim();
}
