import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceClient();

  const [totalRes, statusRes, categoryRes] = await Promise.all([
    supabase.from("creators").select("*", { count: "exact", head: true }),
    supabase.from("creators").select("dm_status"),
    supabase.from("creators").select("category"),
  ]);

  const statuses = statusRes.data || [];
  const categories = categoryRes.data || [];
  const categoryCount: Record<string, number> = {};
  for (const c of categories) {
    categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
  }

  return NextResponse.json({
    total: totalRes.count || 0,
    pending: statuses.filter((s) => s.dm_status === "pending").length,
    sent: statuses.filter((s) => s.dm_status === "sent").length,
    replied: statuses.filter((s) => s.dm_status === "replied").length,
    categoryCount,
  });
}
