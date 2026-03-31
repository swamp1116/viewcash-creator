/**
 * 한국인 인스타 크리에이터 대규모 수집
 * 네이버 검색 기반, 팔로워 1,000~50,000명 타겟
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

const SEARCH_QUERIES: { query: string; category: string }[] = [
  // 일상
  { query: "한국 인스타 일상 크리에이터", category: "일상" },
  { query: "인스타 브이로그 크리에이터 한국", category: "일상" },
  { query: "인스타 일상계정 추천", category: "일상" },
  { query: "인스타그램 한국 마이크로 인플루언서", category: "일상" },
  { query: "인스타 감성 계정 추천 한국", category: "일상" },
  { query: "인스타 셀카 계정 한국 추천", category: "일상" },
  { query: "한국 인스타 소통 계정 추천", category: "일상" },
  // 뷰티
  { query: "한국 뷰티 인플루언서 인스타", category: "뷰티" },
  { query: "인스타 뷰티 크리에이터 추천", category: "뷰티" },
  { query: "뷰티 유튜버 인스타그램 한국", category: "뷰티" },
  { query: "메이크업 크리에이터 한국 인스타", category: "뷰티" },
  { query: "인스타 스킨케어 크리에이터 추천", category: "뷰티" },
  { query: "한국 화장품 리뷰 인플루언서", category: "뷰티" },
  { query: "뷰티 마이크로 인플루언서 한국", category: "뷰티" },
  // 패션
  { query: "한국 패션 인플루언서 인스타", category: "패션" },
  { query: "인스타 패션 크리에이터 추천", category: "패션" },
  { query: "OOTD 크리에이터 한국 인스타", category: "패션" },
  { query: "스트릿 패션 인스타 한국", category: "패션" },
  { query: "한국 코디 추천 인플루언서 인스타", category: "패션" },
  { query: "빈티지 패션 크리에이터 한국", category: "패션" },
  { query: "남자 패션 인플루언서 인스타", category: "패션" },
  // 음식
  { query: "먹방 크리에이터 인스타 한국", category: "음식" },
  { query: "음식 인플루언서 한국 인스타", category: "음식" },
  { query: "맛집 크리에이터 인스타그램 추천", category: "음식" },
  { query: "홈쿡 인스타 크리에이터 한국", category: "음식" },
  { query: "한국 카페 리뷰 인플루언서 인스타", category: "음식" },
  { query: "디저트 크리에이터 인스타 추천", category: "음식" },
  { query: "자취 요리 인스타 크리에이터", category: "음식" },
  // 여행
  { query: "여행 크리에이터 인스타 한국", category: "여행" },
  { query: "한국 여행 인플루언서 추천", category: "여행" },
  { query: "트래블 크리에이터 인스타그램", category: "여행" },
  { query: "국내여행 인스타 크리에이터 추천", category: "여행" },
  { query: "해외여행 인플루언서 한국 인스타", category: "여행" },
  { query: "호캉스 인스타 추천 계정", category: "여행" },
  // 운동
  { query: "운동 크리에이터 인스타 한국", category: "운동" },
  { query: "피트니스 인플루언서 한국 인스타", category: "운동" },
  { query: "홈트 크리에이터 인스타그램 추천", category: "운동" },
  { query: "필라테스 인스타 크리에이터 한국", category: "운동" },
  { query: "헬스 인플루언서 인스타 추천", category: "운동" },
  { query: "요가 크리에이터 인스타 한국", category: "운동" },
  { query: "러닝 크리에이터 인스타 추천", category: "운동" },
  // 게임
  { query: "게임 크리에이터 인스타 한국", category: "게임" },
  { query: "한국 게이머 인스타그램 추천", category: "게임" },
  { query: "모바일게임 인플루언서 인스타", category: "게임" },
  { query: "게임 유튜버 인스타 한국", category: "게임" },
  // 펫
  { query: "반려동물 크리에이터 인스타 한국", category: "펫" },
  { query: "강아지 인스타 인플루언서 추천", category: "펫" },
  { query: "고양이 크리에이터 한국 인스타", category: "펫" },
  { query: "펫 인플루언서 한국 추천", category: "펫" },
  { query: "반려견 인스타 추천 계정", category: "펫" },
  // 육아
  { query: "육아 크리에이터 인스타 한국", category: "육아" },
  { query: "맘스타그래머 추천 계정", category: "육아" },
  { query: "한국 육아 인플루언서 인스타", category: "육아" },
  { query: "아기 인스타 육아 계정", category: "육아" },
  // 공부
  { query: "공부 크리에이터 인스타 한국", category: "공부" },
  { query: "스터디그램 추천 계정 한국", category: "공부" },
  { query: "공스타그램 인플루언서 추천", category: "공부" },
  { query: "수험생 인스타 계정 추천", category: "공부" },
  // 직장인
  { query: "직장인 인스타 크리에이터 한국", category: "직장인" },
  { query: "퇴근 후 인스타 계정 추천", category: "직장인" },
  { query: "사회초년생 인스타 인플루언서", category: "직장인" },
  // 요리
  { query: "요리 크리에이터 인스타 한국", category: "요리" },
  { query: "레시피 인플루언서 인스타 추천", category: "요리" },
  { query: "집밥 크리에이터 인스타 한국", category: "요리" },
  { query: "베이킹 인스타 크리에이터 추천", category: "요리" },
  // 인테리어
  { query: "인테리어 크리에이터 인스타 한국", category: "인테리어" },
  { query: "집꾸미기 인스타 추천 계정", category: "인테리어" },
  { query: "홈스타그래머 인플루언서 한국", category: "인테리어" },
  { query: "원룸 인테리어 인스타 추천", category: "인테리어" },
  // 재테크
  { query: "재테크 인스타 크리에이터 한국", category: "재테크" },
  { query: "주식 인플루언서 인스타 추천", category: "재테크" },
  { query: "부동산 인스타 크리에이터", category: "재테크" },
  { query: "절약 인스타 계정 추천 한국", category: "재테크" },
  // 연예/댄스
  { query: "댄스 크리에이터 인스타 한국", category: "댄스" },
  { query: "커버댄스 인플루언서 인스타", category: "댄스" },
  { query: "K-pop 댄스 크리에이터 인스타", category: "댄스" },
  // 음악
  { query: "음악 크리에이터 인스타 한국", category: "음악" },
  { query: "싱어송라이터 인스타 추천 한국", category: "음악" },
  { query: "커버 가수 인스타 크리에이터", category: "음악" },
  { query: "기타 연주 인스타 크리에이터", category: "음악" },
  // 사진
  { query: "사진 크리에이터 인스타 한국", category: "사진" },
  { query: "포토그래퍼 인스타 추천 한국", category: "사진" },
  { query: "인스타 감성사진 크리에이터", category: "사진" },
  { query: "필름카메라 인스타 계정 추천", category: "사진" },
  // 자연/캠핑
  { query: "캠핑 크리에이터 인스타 한국", category: "캠핑" },
  { query: "차박 인플루언서 인스타 추천", category: "캠핑" },
  { query: "등산 크리에이터 인스타 한국", category: "캠핑" },
  { query: "자연 인스타 계정 추천 한국", category: "캠핑" },
  { query: "백패킹 인스타 크리에이터", category: "캠핑" },
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
    /@([a-zA-Z0-9._]{3,30})/g,
  ];

  const blocked = new Set([
    "p", "reel", "reels", "explore", "stories", "accounts", "about",
    "developer", "legal", "help", "privacy", "terms", "api", "press",
    "blog", "jobs", "nametag", "session", "login", "emails", "signup",
    "download", "challenge", "direct", "lite", "web", "tv", "igtv",
    "shopping", "shop", "creator", "business", "music",
  ]);

  const handles = new Set<string>();
  for (const p of patterns) {
    let match;
    while ((match = p.exec(html)) !== null) {
      const handle = match[1].toLowerCase();
      if (
        handle.length >= 3 &&
        handle.length <= 30 &&
        !handle.includes("...") &&
        !handle.startsWith(".") &&
        !handle.endsWith(".") &&
        !blocked.has(handle) &&
        !/^\d+$/.test(handle)
      ) {
        handles.add(handle);
      }
    }
  }

  return Array.from(handles);
}

export async function crawlCreators(
  keywordCount: number = 10,
  onProgress?: (msg: string) => void
): Promise<CrawledCreator[]> {
  const shuffled = [...SEARCH_QUERIES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, keywordCount);

  const allResults: CrawledCreator[] = [];
  const seenHandles = new Set<string>();

  for (const { query, category } of selected) {
    onProgress?.(`검색: ${query}`);

    try {
      const url = `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) continue;
      const html = await res.text();

      const handles = extractInstagramHandles(html);

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

      onProgress?.(`  ${query}: ${handles.length}개 → 누적 ${allResults.length}개`);
    } catch {
      continue;
    }

    await new Promise((r) => setTimeout(r, 600));
  }

  return allResults;
}
