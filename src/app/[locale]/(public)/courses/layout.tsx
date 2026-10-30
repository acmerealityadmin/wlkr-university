import { RequireLogin } from '@/components/layout/RequireLogin';

export default function MembersOnlyLayout({ children }: { children: React.ReactNode }) {
  return <RequireLogin>{children}</RequireLogin>;
}
