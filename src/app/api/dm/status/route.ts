import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  const { creatorId, status } = (await req.json()) as {
    creatorId: string;
    status: "pending" | "sent" | "replied";
  };

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("creators")
    .update({ dm_status: status })
    .eq("id", creatorId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
