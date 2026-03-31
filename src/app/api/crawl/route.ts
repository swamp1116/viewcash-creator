import { NextResponse } from "next/server";
import { crawlCreators } from "@/lib/crawler";
import { getServiceClient, generateDm } from "@/lib/supabase";

export const maxDuration = 60;

export async function POST() {
  const supabase = getServiceClient();

  try {
    const { data: existing } = await supabase.from("creators").select("instagram");
    const existingIgs = new Set(existing?.map((c) => c.instagram) || []);

    const results = await crawlCreators(15, (msg) => console.log(msg));
    const newResults = results.filter((c) => !existingIgs.has(c.instagram));

    if (newResults.length === 0) {
      return NextResponse.json({ message: "신규 크리에이터 없음", count: 0 });
    }

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

    return NextResponse.json({ message: `${saved}개 크리에이터 수집`, count: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "크롤링 실패" },
      { status: 500 }
    );
  }
}
