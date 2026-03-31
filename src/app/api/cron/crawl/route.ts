import { NextResponse } from "next/server";
import { crawlCreators } from "@/lib/crawler";
import { getServiceClient, generateDm } from "@/lib/supabase";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getServiceClient();

  try {
    // 기존 인스타 핸들 조회 (중복 방지)
    const { data: existing } = await supabase.from("creators").select("instagram");
    const existingIgs = new Set(existing?.map((c) => c.instagram) || []);

    // 매시간 랜덤 20개 키워드로 크롤링
    const results = await crawlCreators(20, (msg) => console.log(msg));
    const newResults = results.filter((c) => !existingIgs.has(c.instagram));

    if (newResults.length === 0) {
      return NextResponse.json({ message: "신규 없음", count: 0 });
    }

    // DM 문구 생성 + 배치 저장
    const toInsert = newResults.map((c) => ({
      name: c.name,
      instagram: c.instagram,
      followers: c.followers,
      category: c.category,
      dm_message: generateDm(c.name),
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
