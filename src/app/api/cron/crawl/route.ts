import { NextRequest, NextResponse } from "next/server";
import { crawlCreators } from "@/lib/crawler";
import { getServiceClient, generateDm } from "@/lib/supabase";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent") || "";
  if (ua.includes("vercel-cron")) return true;

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader === `Bearer ${cronSecret}`) return true;
  }

  if (!process.env.CRON_SECRET) return true;

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  try {
    const { data: existing } = await supabase.from("creators").select("instagram");
    const existingIgs = new Set(existing?.map((c) => c.instagram) || []);

    const results = await crawlCreators(20, (msg) => console.log(msg));
    const newResults = results.filter(
      (c) => !existingIgs.has(c.instagram) && c.followers <= 200000
    );

    if (newResults.length === 0) {
      return NextResponse.json({ message: "신규 없음", count: 0, crawled: results.length });
    }

    const toInsert = newResults.map((c, i) => ({
      name: c.name,
      instagram: c.instagram,
      followers: c.followers,
      category: c.category,
      dm_message: generateDm(c.name, i),
      dm_status: "pending",
    }));

    let saved = 0;
    for (let i = 0; i < toInsert.length; i += 50) {
      const batch = toInsert.slice(i, i + 50);
      const { data, error } = await supabase.from("creators").insert(batch).select();
      if (!error && data) saved += data.length;
    }

    const { count } = await supabase
      .from("creators")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      message: `${saved}개 신규 수집`,
      crawled: results.length,
      new: newResults.length,
      saved,
      total: count,
    });
  } catch (error) {
    console.error("Cron crawl error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "실패" },
      { status: 500 }
    );
  }
}
