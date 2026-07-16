"use client";

import { BrainGymHub } from "@/components/brain-gym/hub/brain-gym-hub";
import { BrainGymProvider } from "@/lib/brain-gym/hooks/use-brain-gym";

export function GyanView() {
  return (
    <BrainGymProvider>
      <BrainGymHub />
    </BrainGymProvider>
  );
}
