import { NextRequest } from "next/server";
import { crawlCreators } from "@/lib/crawler";
import { getServiceClient, generateDm } from "@/lib/supabase";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 인증
  const ua = req.headers.get("user-agent") || "";
  const isVercel = ua.includes("vercel-cron");
  const cronSecret = process.env.CRON_SECRET;

  if (!isVercel && cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    const supabase = getServiceClient();

    // 기존 인스타 핸들 조회
    const { data: existing } = await supabase.from("creators").select("instagram");
    const existingIgs = new Set(existing?.map((c) => c.instagram) || []);

    // 10개 키워드로 줄여서 타임아웃 방지
    const results = await crawlCreators(10);
    const newResults = results.filter(
      (c) => !existingIgs.has(c.instagram) && c.followers <= 200000
    );

    if (newResults.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, message: "신규 없음", crawled: results.length, saved: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 저장
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

    return new Response(
      JSON.stringify({ ok: true, crawled: results.length, new: newResults.length, saved, total: count }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cron error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "실패" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
