export interface BaseSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export type BaseMultiSelectOption = BaseSelectOption;
