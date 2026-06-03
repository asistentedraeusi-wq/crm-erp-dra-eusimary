import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export default function FormField({ label, required, hint, children }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
        {required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{hint}</p>}
    </div>
  );
}
