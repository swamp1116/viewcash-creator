/**
 * 한국인 인스타 크리에이터 대규모 수집
 * 네이버 검색 기반, 팔로워 1,000~200,000명 타겟
 */

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

// 카테고리별 키워드 풀
const KEYWORD_POOL: Record<string, string[]> = {
  일상: [
    "인스타 일상계정 추천", "인스타 감성계정 추천 한국", "한국 마이크로인플루언서 추천",
    "인스타 소통계정 추천", "인스타 셀카계정 한국", "인스타 브이로그 추천",
    "인스타 일상 릴스 추천", "인스타 갬성 피드 추천", "20대 인스타 추천 계정",
    "30대 인스타 일상 추천", "인스타 팔로우 추천 한국",
  ],
  뷰티: [
    "뷰티인플루언서 추천", "메이크업 인스타 추천 한국", "스킨케어 인스타 추천",
    "화장품리뷰 인스타", "뷰티크리에이터 한국", "뷰스타그램 추천",
    "데일리메이크업 인스타", "립스틱추천 인스타", "파데추천 인스타 크리에이터",
  ],
  패션: [
    "패션인플루언서 인스타 추천", "OOTD 인스타 추천 한국", "코디추천 인스타",
    "스트릿패션 인스타 한국", "빈티지 패션 인스타", "남자패션 인스타 추천",
    "여자코디 인스타 추천", "쇼핑몰 인스타 크리에이터", "패피 인스타 추천",
  ],
  음식: [
    "먹방 인스타 추천", "맛집 인스타 크리에이터", "홈쿡 인스타 추천",
    "카페추천 인스타 한국", "디저트 인스타 추천", "자취요리 인스타",
    "푸드스타그램 추천", "맛스타그램 인플루언서", "술스타그램 추천 계정",
  ],
  여행: [
    "여행 인스타 추천", "국내여행 인스타 크리에이터", "해외여행 인스타 추천",
    "호캉스 인스타 추천", "트래블스타그램 추천", "제주 인스타 크리에이터",
    "유럽여행 인스타 추천", "동남아여행 인스타", "일본여행 인스타 추천",
  ],
  운동: [
    "운동 인스타 추천", "피트니스 인플루언서 한국", "홈트 인스타 추천",
    "필라테스 인스타 크리에이터", "헬스 인스타 추천", "요가 인스타 추천",
    "러닝 인스타 크리에이터", "다이어트 인스타 추천", "크로스핏 인스타",
  ],
  게임: [
    "게임 인스타 추천 한국", "게이머 인스타그램", "모바일게임 인플루언서",
    "게임유튜버 인스타", "스트리머 인스타 추천", "게임방송 인스타",
  ],
  펫: [
    "강아지 인스타 추천", "고양이 인스타 추천", "반려동물 인플루언서",
    "펫스타그램 추천", "멍스타그램 추천", "냥스타그램 추천 계정",
    "펫유튜버 인스타", "강아지일상 인스타",
  ],
  육아: [
    "육아 인스타 추천", "맘스타그래머 추천", "아기인스타 추천",
    "육아인플루언서 한국", "워킹맘 인스타", "육아브이로그 인스타",
  ],
  공부: [
    "공스타그램 추천", "스터디그램 추천", "공부계정 인스타 추천",
    "수험생 인스타", "공부브이로그 인스타", "필기 인스타 추천",
  ],
  직장인: [
    "직장인 인스타 추천", "사회초년생 인스타", "퇴근후 인스타 추천",
    "직장인브이로그 인스타", "N잡러 인스타 추천",
  ],
  요리: [
    "요리 인스타 추천", "레시피 인스타 크리에이터", "집밥 인스타 추천",
    "베이킹 인스타 추천", "요리유튜버 인스타", "간단요리 인스타",
  ],
  인테리어: [
    "인테리어 인스타 추천", "집꾸미기 인스타", "홈스타그래머 추천",
    "원룸인테리어 인스타", "셀프인테리어 인스타", "가구추천 인스타",
  ],
  재테크: [
    "재테크 인스타 추천", "주식 인스타 크리에이터", "절약 인스타 추천",
    "부업 인스타 추천", "투자 인스타 추천", "재테크인플루언서",
  ],
  댄스: [
    "댄스 인스타 추천 한국", "커버댄스 인스타", "K-pop댄스 인스타",
    "댄스크리에이터 인스타", "안무 인스타 추천",
  ],
  음악: [
    "음악 인스타 추천", "싱어송라이터 인스타", "커버가수 인스타",
    "기타연주 인스타", "피아노 인스타 크리에이터", "보컬 인스타 추천",
  ],
  사진: [
    "사진 인스타 추천", "포토그래퍼 인스타 한국", "감성사진 인스타",
    "필름카메라 인스타", "사진작가 인스타 추천", "스냅사진 인스타",
  ],
  캠핑: [
    "캠핑 인스타 추천", "차박 인스타", "등산 인스타 추천",
    "백패킹 인스타", "캠핑크리에이터 인스타", "아웃도어 인스타",
  ],
};

export type CrawledCreator = {
  name: string;
  instagram: string;
  followers: number;
  category: string;
};

function extractInstagramHandles(html: string): string[] {
  // instagram.com/handle 패턴만 사용 (@는 노이즈가 많아서 제외)
  const pattern = /instagram\.com\/([a-zA-Z0-9._]{3,30})/g;

  const blocked = new Set([
    "p", "reel", "reels", "explore", "stories", "accounts", "about",
    "developer", "legal", "help", "privacy", "terms", "api", "press",
    "blog", "jobs", "nametag", "session", "login", "emails", "signup",
    "download", "challenge", "direct", "lite", "web", "tv", "igtv",
    "shopping", "shop", "creator", "business", "music", "directory",
    "ar", "branded_content", "professional", "static",
  ]);

  const handles = new Set<string>();
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const handle = match[1].toLowerCase();
    if (
      handle.length >= 3 &&
      handle.length <= 30 &&
      !handle.includes("...") &&
      !handle.startsWith(".") &&
      !handle.endsWith(".") &&
      !blocked.has(handle) &&
      !/^\d+$/.test(handle) &&
      !/^[a-f0-9]{20,}$/.test(handle)
    ) {
      handles.add(handle);
    }
  }

  return Array.from(handles);
}

export async function crawlCreators(
  keywordCount: number = 10,
  onProgress?: (msg: string) => void
): Promise<CrawledCreator[]> {
  const allResults: CrawledCreator[] = [];
  const seenHandles = new Set<string>();

  // 각 카테고리에서 랜덤으로 키워드 선택
  const categories = Object.keys(KEYWORD_POOL);
  const selectedQueries: { query: string; category: string }[] = [];

  // 카테고리별로 균등 분배
  const perCategory = Math.max(1, Math.ceil(keywordCount / categories.length));
  for (const cat of categories) {
    const pool = KEYWORD_POOL[cat];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(perCategory, shuffled.length); i++) {
      selectedQueries.push({ query: shuffled[i], category: cat });
    }
  }

  // 전체를 셔플하고 keywordCount만큼 자르기
  const finalQueries = selectedQueries
    .sort(() => Math.random() - 0.5)
    .slice(0, keywordCount);

  // 네이버 블로그 검색도 병행 (다른 결과가 나옴)
  const searchTypes = ["nexearch", "blog"];

  for (const { query, category } of finalQueries) {
    // 랜덤으로 검색 타입 선택
    const searchType = searchTypes[Math.floor(Math.random() * searchTypes.length)];
    onProgress?.(`검색: ${query} (${searchType})`);

    try {
      const url = `https://search.naver.com/search.naver?where=${searchType}&query=${encodeURIComponent(query)}`;
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

    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
  }

  return allResults;
}
