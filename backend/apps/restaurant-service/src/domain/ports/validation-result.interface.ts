export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  value?: any;
}