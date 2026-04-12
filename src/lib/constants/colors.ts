export const CANDY_COLORS = [
  { name: "Strawberry Pink", value: "#F4A6B8" },
  { name: "Peach Cream", value: "#F6B38E" },
  { name: "Lemon Candy", value: "#F3D76B" },
  { name: "Mint Soft", value: "#9FD9C2" },
  { name: "Pistachio", value: "#B7D77A" },
  { name: "Sky Tint", value: "#A9D6F5" },
  { name: "Blue Milk", value: "#B8C9F9" },
  { name: "Lavender", value: "#C8B6F2" },
  { name: "Lilac Mist", value: "#D7C2F5" },
  { name: "Rose Dust", value: "#E8B4C8" },
  { name: "Coral Light", value: "#F59C8D" },
  { name: "Butter", value: "#F6E27A" },
  { name: "Seafoam", value: "#9ED9D2" },
  { name: "Ice Blue", value: "#B7E3F6" },
  { name: "Blueberry Cream", value: "#AEB8F5" },
  { name: "Milk Tea", value: "#D6B89C" },
  { name: "Soft Beige", value: "#E8DCC8" },
  { name: "Fog Rose", value: "#D9C7C3" },
] as const;

export const CANDY_COLOR_VALUES: Set<string> = new Set(CANDY_COLORS.map((item) => item.value));
