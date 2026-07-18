export type MatchProfileId = "leila" | "aisha" | "marcus";

export type IncomingPeerMessage = {
  id: string;
  body: string;
  time: string;
};

export type MatchProfile = {
  id: MatchProfileId;
  name: string;
  treatmentLabel: string;
  treatmentStage: string;
  avatarVariant: "teal" | "purple" | "blue";
  statusLabel: string;
  previewTime?: string;
  unread?: boolean;
  incomingMessages: IncomingPeerMessage[];
};

export type LocalPeerMessage = {
  id: string;
  direction: "OUTGOING";
  body: string;
  deliveryState: "DELIVERED";
};

export const matchProfiles = {
  leila: {
    id: "leila",
    name: "Leila",
    treatmentLabel: "GLP-1 journey",
    treatmentStage: "Week 14",
    avatarVariant: "teal",
    statusLabel: "Similar experience",
    previewTime: "10:24 AM",
    unread: true,
    incomingMessages: [
      {
        id: "leila-1",
        body: "Week 7 was the hardest for me. I had nausea after injection day too.",
        time: "10:24 AM",
      },
      {
        id: "leila-2",
        body: "What helped was telling my care team exactly when it happened and how it affected work.",
        time: "10:26 AM",
      },
    ],
  },
  aisha: {
    id: "aisha",
    name: "Aisha",
    treatmentLabel: "Type 2 diabetes care",
    treatmentStage: "Week 12",
    avatarVariant: "purple",
    statusLabel: "Shared experience",
    previewTime: "9:48 AM",
    unread: true,
    incomingMessages: [
      {
        id: "aisha-1",
        body: "I was nervous about continuing at first, but talking it through really helped.",
        time: "9:48 AM",
      },
      {
        id: "aisha-2",
        body: "Writing down when the difficult days happened made it much easier to explain what support I needed.",
        time: "9:51 AM",
      },
    ],
  },
  marcus: {
    id: "marcus",
    name: "Marcus",
    treatmentLabel: "GLP-1 and type 2 diabetes",
    treatmentStage: "Week 10",
    avatarVariant: "blue",
    statusLabel: "Strong match",
    incomingMessages: [],
  },
} as const satisfies Record<MatchProfileId, MatchProfile>;

export const existingMatchInbox = [
  matchProfiles.leila,
  matchProfiles.aisha,
] as const;

export const dailyMatch = {
  profile: matchProfiles.marcus,
  description:
    "You both went through slow early progress with GLP-1 treatment, uncertainty about whether it was working, and concern about staying consistent with your type 2 diabetes plan.",
  commonExperiences: [
    "Similar treatment stage",
    "Progress felt slow at first",
    "Type 2 diabetes care",
    "Both wanted practical support",
  ],
  story:
    "Progress felt slow for me at first, and I started wondering whether the treatment was doing anything. What helped was writing down the smaller changes and speaking to my care team before deciding what to do next.",
} as const;

export function inboxPreview(profile: MatchProfile): string {
  const firstMessage = profile.incomingMessages[0];
  if (!firstMessage) {
    throw new Error(`${profile.name} cannot appear in the inbox without a first message.`);
  }
  return firstMessage.body;
}

for (const profile of existingMatchInbox) {
  inboxPreview(profile);
}
