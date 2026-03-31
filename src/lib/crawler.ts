/**
 * 네이버/구글 검색으로 한국인 인스타 크리에이터 수집
 * 팔로워 1,000~50,000명 타겟
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

const SEARCH_QUERIES = [
  // 일상/라이프스타일
  "한국 인스타 일상 크리에이터", "인스타 브이로그 크리에이터 한국",
  "인스타 일상계정 추천", "인스타그램 한국 마이크로 인플루언서",
  // 뷰티
  "한국 뷰티 인플루언서 인스타", "인스타 뷰티 크리에이터 추천",
  "뷰티 유튜버 인스타그램", "메이크업 크리에이터 한국",
  // 패션
  "한국 패션 인플루언서 인스타", "인스타 패션 크리에이터",
  "OOTD 크리에이터 한국", "스트릿 패션 인스타",
  // 음식
  "먹방 크리에이터 인스타", "음식 인플루언서 한국",
  "맛집 크리에이터 인스타그램", "홈쿡 인스타 크리에이터",
  // 여행
  "여행 크리에이터 인스타", "한국 여행 인플루언서",
  "트래블 크리에이터 인스타그램",
  // 운동
  "운동 크리에이터 인스타", "피트니스 인플루언서 한국",
  "홈트 크리에이터 인스타그램",
  // 게임
  "게임 크리에이터 인스타", "한국 게이머 인스타그램",
  // 펫
  "반려동물 크리에이터 인스타", "강아지 인스타 인플루언서",
  "고양이 크리에이터 한국",
];

export type CrawledCreator = {
  name: string;
  instagram: string;
  followers: number;
  category: string;
};

function extractInstagramHandles(html: string): string[] {
  const patterns = [
    /instagram\.com\/([a-zA-Z0-9._]{2,30})/g,
    /@([a-zA-Z0-9._]{2,30})/g,
  ];

  const handles = new Set<string>();
  for (const p of patterns) {
    let match;
    while ((match = p.exec(html)) !== null) {
      const handle = match[1].toLowerCase();
      if (
        handle.length >= 3 &&
        !handle.includes("...") &&
        !["p", "reel", "reels", "explore", "stories", "accounts", "about", "developer", "legal", "help"].includes(handle)
      ) {
        handles.add(handle);
      }
    }
  }

  return Array.from(handles);
}

function guessCategory(query: string): string {
  if (query.includes("뷰티") || query.includes("메이크업")) return "뷰티";
  if (query.includes("패션") || query.includes("OOTD") || query.includes("스트릿")) return "패션";
  if (query.includes("먹방") || query.includes("음식") || query.includes("맛집") || query.includes("홈쿡")) return "음식";
  if (query.includes("여행") || query.includes("트래블")) return "여행";
  if (query.includes("운동") || query.includes("피트니스") || query.includes("홈트")) return "운동";
  if (query.includes("게임") || query.includes("게이머")) return "게임";
  if (query.includes("반려") || query.includes("강아지") || query.includes("고양이")) return "펫";
  return "일상";
}

export async function crawlCreators(
  keywordCount: number = 10,
  onProgress?: (msg: string) => void
): Promise<CrawledCreator[]> {
  const shuffled = [...SEARCH_QUERIES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, keywordCount);

  const allResults: CrawledCreator[] = [];
  const seenHandles = new Set<string>();

  for (const query of selected) {
    onProgress?.(`검색: ${query}`);

    try {
      const url = `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) continue;
      const html = await res.text();

      const handles = extractInstagramHandles(html);
      const category = guessCategory(query);

      for (const handle of handles) {
        if (seenHandles.has(handle)) continue;
        seenHandles.add(handle);

        allResults.push({
          name: handle,
          instagram: `https://www.instagram.com/${handle}/`,
          followers: 0,
          category,
        });
      }

      onProgress?.(`  ${query}: ${handles.length}개 핸들 → 누적 ${allResults.length}개`);
    } catch {
      continue;
    }

    await new Promise((r) => setTimeout(r, 800));
  }

  return allResults;
}
