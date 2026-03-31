"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Send,
  MessageCircle,
  Search,
  Loader2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import type { Creator } from "@/lib/supabase";

type Stats = {
  total: number;
  pending: number;
  sent: number;
  replied: number;
  categoryCount: Record<string, number>;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [crawling, setCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/stats");
    if (res.ok) setStats(await res.json());
  }, []);

  const fetchCreators = useCallback(
    async (p: number, status?: string) => {
      const params = new URLSearchParams({ page: String(p), limit: "50" });
      if (status) params.set("status", status);
      const res = await fetch(`/api/creators?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCreators(data.data || []);
        setTotal(data.total || 0);
      }
    },
    []
  );

  useEffect(() => {
    fetchStats();
    fetchCreators(1, filterStatus);
  }, [fetchStats, fetchCreators, filterStatus]);

  const handleCrawl = async () => {
    setCrawling(true);
    setCrawlStatus("크롤링 중...");
    try {
      const res = await fetch("/api/crawl", { method: "POST" });
      const data = await res.json();
      setCrawlStatus(data.message || "완료");
      fetchStats();
      fetchCreators(1, filterStatus);
      setPage(1);
    } catch {
      setCrawlStatus("크롤링 실패");
    } finally {
      setCrawling(false);
    }
  };

  const handleCopyDm = async (creator: Creator) => {
    if (!creator.dm_message) return;
    await navigator.clipboard.writeText(creator.dm_message);
    setCopiedId(creator.id);

    // 자동으로 dm_status를 sent로 변경
    if (creator.dm_status === "pending") {
      await fetch("/api/dm/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: creator.id, status: "sent" }),
      });
      fetchCreators(page, filterStatus);
      fetchStats();
    }

    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (
    id: string,
    status: "sent" | "replied"
  ) => {
    await fetch("/api/dm/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId: id, status }),
    });
    fetchCreators(page, filterStatus);
    fetchStats();
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchCreators(p, filterStatus);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1);
    fetchCreators(1, status);
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              뷰캐시 크리에이터 영업
            </h1>
            <p className="text-sm text-gray-500">
              인스타 크리에이터 DM 영업 대시보드
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCrawl}
              disabled={crawling}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-violet-700 transition"
            >
              {crawling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {crawling ? "크롤링 중..." : "크리에이터 크롤링"}
            </button>
            {crawlStatus && (
              <span className="text-sm text-gray-500">{crawlStatus}</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">전체 크리에이터</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="bg-violet-500 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">DM발송완료</p>
                  <p className="text-3xl font-bold mt-1">{stats.sent}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    대기 {stats.pending}
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">답장옴</p>
                  <p className="text-3xl font-bold mt-1">{stats.replied}</p>
                </div>
                <div className="bg-pink-500 p-3 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter + Table */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              크리에이터 목록 ({total}명)
            </h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 ml-4">
              {[
                { label: "전체", value: "" },
                { label: "발송대기", value: "pending" },
                { label: "DM발송완료", value: "sent" },
                { label: "답장옴", value: "replied" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFilterChange(f.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    filterStatus === f.value
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    크리에이터
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    팔로워
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    인스타
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    카테고리
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    DM 문구
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {creators.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {c.followers >= 10000
                        ? `${(c.followers / 10000).toFixed(1).replace(/\.0$/, "")}만`
                        : c.followers > 0
                          ? c.followers.toLocaleString()
                          : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={c.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 font-medium text-xs underline flex items-center gap-1"
                      >
                        {c.instagram
                          .replace("https://www.instagram.com/", "@")
                          .replace(/\/$/, "")}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-violet-50 text-violet-700 rounded-full text-xs">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[300px]">
                      {c.dm_message ? (
                        <div className="flex items-start gap-1">
                          <p
                            className="text-xs text-gray-600 line-clamp-2 flex-1"
                            title={c.dm_message}
                          >
                            {c.dm_message}
                          </p>
                          <button
                            onClick={() => handleCopyDm(c)}
                            className={`shrink-0 px-2 py-1 rounded text-xs transition ${
                              copiedId === c.id
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {copiedId === c.id ? (
                              <span className="flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> 복사됨
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Copy className="w-3 h-3" /> 복사
                              </span>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.dm_status === "replied" ? (
                        <span className="px-2 py-0.5 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                          답장옴
                        </span>
                      ) : c.dm_status === "sent" ? (
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                            DM발송완료
                          </span>
                          <button
                            onClick={() =>
                              handleStatusChange(c.id, "replied")
                            }
                            className="px-1.5 py-0.5 text-xs text-pink-600 hover:bg-pink-50 rounded transition"
                          >
                            답장옴
                          </button>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium">
                          발송대기
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {creators.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      크리에이터가 없습니다. 크롤링을 시작해주세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-30"
              >
                이전
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-30"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
