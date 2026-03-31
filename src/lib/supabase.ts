import { createClient } from "@supabase/supabase-js";

export type Creator = {
  id: string;
  name: string;
  instagram: string;
  followers: number;
  category: string;
  dm_message: string | null;
  dm_status: "pending" | "sent" | "replied";
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getServiceClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

const DM_TEMPLATES = [
  (name: string) =>
    `안녕하세요, ${name}님! 😊\n단독으로 먼저 말씀드려요. 놀고 있는 조회수로 수익 받아가세요! 💰\n저희가 새롭게 개발한 플랫폼 '뷰캐시'는 오직 진정성 있는 조회수만으로 수익을 정산해 드립니다.\n현재 베타 테스터 모집 중인데, ${name}님의 콘텐츠가 저희가 찾는 딱 맞는 모델이라 연락드렸습니다!\n테스터 참여 시 활동 지원금 5만 원은 물론, 발생한 조회수 정산금까지 100% 본인이 가져가실 수 있습니다. 자세한 내용은 아래 폼에서 확인해 주세요!\n🔗 https://forms.gle/jsYXq82yptM9RfCq7`,

  (name: string) =>
    `안녕하세요, ${name}님! 반갑습니다 🙌\n혹시 조회수가 그냥 쌓이고만 있지 않으신가요? 💸\n저희 플랫폼 '뷰캐시'는 진정성 있는 조회수만으로 수익을 정산해 드리는 새로운 서비스예요.\n지금 베타 테스터를 모집 중인데, ${name}님 콘텐츠가 딱 맞아서 연락드렸어요!\n참여하시면 활동 지원금 5만 원 + 조회수 정산금 100% 지급해 드립니다. 아래 폼에서 확인해 보세요 😊\n🔗 https://forms.gle/jsYXq82yptM9RfCq7`,

  (name: string) =>
    `${name}님, 안녕하세요! 🌟\n다름이 아니라 좋은 소식 전해드리려고 연락드렸어요.\n저희가 만든 '뷰캐시'는 진짜 조회수만으로 수익을 드리는 플랫폼이에요. 💰\n현재 베타 테스터 모집 중인데 ${name}님 채널이 저희가 찾던 스타일이라 먼저 연락드렸습니다!\n지원금 5만 원은 기본이고, 조회수 정산금까지 100% 챙겨가실 수 있어요. 폼 한번 확인해 주세요!\n🔗 https://forms.gle/jsYXq82yptM9RfCq7`,

  (name: string) =>
    `안녕하세요 ${name}님! 콘텐츠 잘 보고 있어요 ✨\n혹시 조회수로 수익 받아보신 적 있으세요? 🤔\n저희 '뷰캐시'는 진정성 있는 조회수만으로 정산해 드리는 새로운 방식의 플랫폼이에요.\n베타 테스터 모집 중인데 ${name}님이 딱이다 싶어서 먼저 연락드렸습니다!\n참여하시면 활동 지원금 5만 원 + 발생 조회수 정산금 100% 드려요. 아래에서 확인해 주세요 🙏\n🔗 https://forms.gle/jsYXq82yptM9RfCq7`,
];

export function generateDm(name: string, index?: number): string {
  const idx = index !== undefined ? index % 4 : Math.floor(Math.random() * 4);
  return DM_TEMPLATES[idx](name);
}
