import { formatSalary } from '@/lib/formatters';

interface SalaryCellProps {
  amount: bigint;
  currency: string;
  displayCurrency?: string;
}

export default function SalaryCell({
  amount,
  currency,
  displayCurrency,
}: SalaryCellProps) {
  // Use the currency as fallback if displayCurrency is not provided
  const targetDisplayCurrency = displayCurrency || currency;
  const formatted = formatSalary(amount, currency, targetDisplayCurrency);

  return <span>{formatted}</span>;
}
