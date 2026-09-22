import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/data";
import { SettingsManager } from "@/components/admin/SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const s = await getSettings();
  return (
    <SettingsManager
      config={{ businessName: s.businessName, currency: s.currency, whatsappNumber: s.whatsappNumber }}
      content={s.content}
    />
  );
}
