"use client";

import ShareableCard from "@/components/catch/ShareableCard";
import type { Catch } from "@/types";

export default function ShareableCardWrapper({ data }: { data: Catch }) {
  return <ShareableCard data={data} />;
}
