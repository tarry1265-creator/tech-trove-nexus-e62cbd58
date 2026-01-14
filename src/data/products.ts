export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  description: string;
  category: string;
  inStock: boolean;
  features?: string[];
  colors?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

export const categories = [
  { id: "all", name: "All", icon: "apps" },
  { id: "headphones", name: "Headphones", icon: "headphones" },
  { id: "earbuds", name: "Earbuds", icon: "earbuds" },
  { id: "speakers", name: "Speakers", icon: "speaker" },
  { id: "wearables", name: "Wearables", icon: "watch" },
  { id: "gaming", name: "Gaming", icon: "sports_esports" },
  { id: "accessories", name: "Accessories", icon: "cable" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Quantum Pro Elite",
    brand: "Sony",
    price: 349,
    originalPrice: 399,
    rating: 4.9,
    reviewCount: 2847,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFuOp3FS5Z4sbC1kFCmeySHuReOJPV2Q4TBrwbBamBbzuTK2gIVZwhdWfZxNrk9jMopbYy7gBjZyz7jNF2oOXnECdxPELMHKxfIdL9XiPVO6rI_GVdwRg8Q75JroPvrKSKN4ozwPpXR7o3fU2DWRxaunwGCQC0ifOOo-YN1cscXo85SPbUoQXB4B50uqxOa4dSaVoVgdTR7RgxC3aRxtGSXad-5R2FAZNG7b_X8CZPvnS5s6WbbSBh7JD2LHiqjDfAEwu_ZE562w",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFuOp3FS5Z4sbC1kFCmeySHuReOJPV2Q4TBrwbBamBbzuTK2gIVZwhdWfZxNrk9jMopbYy7gBjZyz7jNF2oOXnECdxPELMHKxfIdL9XiPVO6rI_GVdwRg8Q75JroPvrKSKN4ozwPpXR7o3fU2DWRxaunwGCQC0ifOOo-YN1cscXo85SPbUoQXB4B50uqxOa4dSaVoVgdTR7RgxC3aRxtGSXad-5R2FAZNG7b_X8CZPvnS5s6WbbSBh7JD2LHiqjDfAEwu_ZE562w",
    ],
    description: "Experience unparalleled sound with industry-leading noise cancellation and 40-hour battery life.",
    category: "headphones",
    inStock: true,
    features: ["Active Noise Cancellation", "40-Hour Battery", "Hi-Res Audio", "Multipoint Connection"],
    colors: ["Midnight Black", "Platinum Silver", "Rose Gold"],
    isNew: true,
    isFeatured: true,
  },
  {
    id: "2",
    name: "AirPods Max",
    brand: "Apple",
    price: 549,
    rating: 4.8,
    reviewCount: 5623,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM7oYTFj86re6fuX8YoUdfAHnJDz6BYAIa7Fy_XRqlvSjAwLywygPfmKt9fGgCkqXn0daUGFmYqphNg2cUbjjzKjEz4q3RbOYVaOuu0UuRTnx-IVSHrEBaSObL8UafUIFOIET104cIgEVGtcN_STFrzpDcP2TzbKJgnkNfQvFj9bAvG3LXnJQcBzKSSlJ1v0E7V9ssWvcZq4SiihWJyqw4ObVvLN6_k7-kiDAGhqQZp1uaALMgKSV8Afb-0ifvRnuwswqPdYt4DQ",
    description: "Premium over-ear headphones with computational audio and spatial sound.",
    category: "headphones",
    inStock: true,
    features: ["Spatial Audio", "Digital Crown", "Premium Build", "Apple Ecosystem"],
    colors: ["Silver", "Space Gray", "Sky Blue", "Pink", "Green"],
    isFeatured: true,
  },
  {
    id: "3",
    name: "Nothing Ear (2)",
    brand: "Nothing",
    price: 149,
    originalPrice: 179,
    rating: 4.6,
    reviewCount: 1892,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1E-2YB7H5lslNqGe1fLLzIN2HCcKwpqNy3Fns6mZO-O4pLEpMrMSx67l7G2Vg49ySbh42wxE5aWwuhOpfgVuS_bgdLv5MmWPZQzR1mPdpzkfI3RoXTBmNPxEg48G_K7tZwxPqpT_hl-x3dpDSFl_19ppQrYrIaPQ4v7LWEUYIHgTa99aPh-F3SbLi43qyS9T7lJiDDQF1Ce7AqbXFelBIv06zBc2UQ9e3evMqWCs1PUTa7XBAlItpctn6IXqmxuHSJY9r-_dKMA",
    description: "Transparent design meets powerful performance with advanced ANC.",
    category: "earbuds",
    inStock: true,
    features: ["Transparent Design", "ANC", "36hr Total Battery", "Wireless Charging"],
    colors: ["White", "Black"],
    isNew: true,
  },
  {
    id: "4",
    name: "Momentum 4 Wireless",
    brand: "Sennheiser",
    price: 299,
    rating: 4.7,
    reviewCount: 1245,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIkCDW3qurYH8SKvsGcM0M2o48JGrKk3YTu1Ai_7jsqlHX6WHIKUWvNLt_TMgxXiTGRwq4DD1FYy0Md6wyPhdT7yAJo4inrgcWJHjOfkU_Mp8XPggw9vOca7xTV--o4Sdl6ke1RbDxCP9ybqVhaHUtXyZS3qqh-HBVPd3XR091IkRbGuNJDyUdy2tLg846y3t4thgZWRF7C2TITxN5G1QKknVZsJEtdqDIuDnC5w3Yym0oJ_ucq0N8vQBdAycbOE4e4TvYbAauAQ",
    description: "Audiophile-grade sound quality with exceptional comfort for all-day listening.",
    category: "headphones",
    inStock: true,
    features: ["Audiophile Sound", "60-Hour Battery", "Adaptive ANC", "Premium Leather"],
    colors: ["Black", "White"],
  },
  {
    id: "5",
    name: "QuietComfort Ultra",
    brand: "Bose",
    price: 429,
    rating: 4.8,
    reviewCount: 3421,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPP20GAdPIuYD0VzndtUg5JoaXikDnmMTVbhC22ksWs-U0B8t1sXdZQmqfInp23pPmIyzo0CHFhXmyG187rtS-cab1TsLz3gnHfEypyRAtycbAqIuVzz57MXGYWR6l_utDsZJ8HRoRlH1Ob6IQlYNqgZK3RpE0VWG91fVSBXyKP_JbwtZFRUJoq5AqANKNySSF3eEPkgzkvxpkVcHIC48YeV4uk2gJCziUyq-PghpF-BdpqBWE831z_A9TFTy_EuLKMR6wQUojrw",
    description: "World-class noise cancellation with immersive spatial audio experience.",
    category: "headphones",
    inStock: true,
    features: ["Immersive Audio", "CustomTune", "Aware Mode", "24hr Battery"],
    colors: ["Black", "White Smoke"],
    isFeatured: true,
  },
  {
    id: "6",
    name: "Titan Pro Smartwatch",
    brand: "TitanTech",
    price: 299,
    originalPrice: 349,
    rating: 4.9,
    reviewCount: 892,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1BPv0IW16BXiy2Rq_ZBes1iU7AXD7z7piUigZBYNQ4M-upqKkFBOpcCVPZMEJ42XikzqejX3evfiyeP3vLoliYl4VBL2CNpbVA-OtaWo9VNR1Ofq9aeg6Tgjab_-TG_syp1C3WCMRjtVkU8yqFBe7LCokitI9FSwrErWFKzRsM9rKyTVZjQMefRnu10LjO-t6fPaEbQzs3Yxo5h0868sCnSLKYNH1R4PFDcuPaQv08N4dzfVdiz_jcajetArP9ovENjTGrKihA",
    description: "Premium AMOLED smartwatch with advanced health monitoring and GPS.",
    category: "wearables",
    inStock: true,
    features: ["AMOLED Display", "Health Monitoring", "Built-in GPS", "5-Day Battery"],
    colors: ["Obsidian", "Gold", "Silver"],
    isNew: true,
  },
  {
    id: "7",
    name: "Neon RGB Keyboard",
    brand: "Razer",
    price: 159,
    rating: 4.7,
    reviewCount: 2156,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5Lc54W-MpJG4Rm7TBtVoo4ceEG1e9NZU9NOkjZrlKSFBBn7xf2rrDiB_UiLkg-RVS14audwgENgpjl1S-NirtsymFJsNNMVgj9C7RHrz99N1jtLORAzEpuzS3hPxl093qcTNQmlHTurtkI21qOUH6NDIl0UsLQJ6DdYZL3lHVFr8D_Qtlz1N-TIMwZzbiXhb8CLZkX9yT6GUbVzOWAoIrm7fbZOuBhIhxJcNky1eWlZ9Km1q3U3rbv6Dy9rUUtokBlG9kyw9Jtg",
    description: "Mechanical gaming keyboard with per-key RGB and hot-swappable switches.",
    category: "gaming",
    inStock: true,
    features: ["Mechanical Switches", "Per-Key RGB", "Hot-Swappable", "Wrist Rest"],
    colors: ["Black", "Mercury White"],
  },
  {
    id: "8",
    name: "Cyber Cooler X Pro",
    brand: "CoolMaster",
    price: 129,
    rating: 4.5,
    reviewCount: 678,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ_IQCIkNOXqTGx0e2fTLDL8jOUEXbBSBtddXXeoGTHedm1majHGHtBUTaASE6IYhX-NSOG2FLmSD2W0W3oD9orBb5ytNQwS72YYwg7OGs7aVyOM9eoAxVGF8Zn2sErawNIgCi3HMsTIpJ34ybU1j8di0reakOSRT7rWyWRe7rtaSialvFldX-thnmRO-kkNf1cHYkuOpMqrNMmnjj7tiKsed7Em5wXU5FZOSck4wniLo3EJZO1TJBIJpWRyIb8shd8os3eMuW0w",
    description: "Advanced liquid cooling system with RGB lighting and quiet operation.",
    category: "accessories",
    inStock: true,
    features: ["360mm Radiator", "ARGB Lighting", "Quiet Fans", "Easy Install"],
    colors: ["Black"],
  },
];

// Mock cart data
export const mockCartItems: CartItem[] = [
  { ...products[0], quantity: 1, selectedColor: "Midnight Black" },
  { ...products[2], quantity: 2, selectedColor: "White" },
];

// Mock wishlist data
export const mockWishlistItems: Product[] = [
  products[1],
  products[4],
  products[5],
];

// Mock user data
export const mockUser = {
  id: "1",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  phone: "+1 (555) 123-4567",
  address: {
    street: "123 Premium Avenue",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    country: "United States",
  },
  orders: 12,
  wishlistCount: 3,
  memberSince: "2023",
};
