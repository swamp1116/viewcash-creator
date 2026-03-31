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

const DM_TEMPLATE = (name: string) =>
  `안녕하세요, ${name}님!\n단독 진입적으로 말씀드립니다. 놀고 있는 조회수로 수익 받아가세요! 💰\n저희가 새롭게 개발한 플랫폼 '뷰캐시'는 오직 진정성 있는 조회수만으로 수익을 정산해 드립니다.\n현재 베타 테스터 모집 중인데, ${name}님의 콘텐츠가 저희가 찾는 딱 맞는 모델이라 연락드렸습니다!\n테스터 참여 시 활동 지원금 5만 원은 물론, 발생한 조회수 정산금까지 100% 본인이 가져가실 수 있습니다. 자세한 내용은 아래 폼에서 확인해 주세요!\n🔗 https://forms.gle/jsYXq82yptM9RfCq7`;

export function generateDm(name: string): string {
  return DM_TEMPLATE(name);
}
