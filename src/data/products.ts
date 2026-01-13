export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  category: string;
}

export const categories = [
  "Headphones",
  "Coolers",
  "Gaming",
  "Wearables",
  "Laptops",
  "Accessories",
];

export const products: Product[] = [
  {
    id: "1",
    name: "Quantum Headset",
    brand: "Sony",
    price: 299,
    rating: 4.8,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFuOp3FS5Z4sbC1kFCmeySHuReOJPV2Q4TBrwbBamBbzuTK2gIVZwhdWfZxNrk9jMopbYy7gBjZyz7jNF2oOXnECdxPELMHKxfIdL9XiPVO6rI_GVdwRg8Q75JroPvrKSKN4ozwPpXR7o3fU2DWRxaunwGCQC0ifOOo-YN1cscXo85SPbUoQXB4B50uqxOa4dSaVoVgdTR7RgxC3aRxtGSXad-5R2FAZNG7b_X8CZPvnS5s6WbbSBh7JD2LHiqjDfAEwu_ZE562w",
    description: "Pro Noise Canceling",
    category: "Headphones",
  },
  {
    id: "2",
    name: "Cyber Cooler X",
    brand: "CoolMaster",
    price: 85,
    rating: 4.5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ_IQCIkNOXqTGx0e2fTLDL8jOUEXbBSBtddXXeoGTHedm1majHGHtBUTaASE6IYhX-NSOG2FLmSD2W0W3oD9orBb5ytNQwS72YYwg7OGs7aVyOM9eoAxVGF8Zn2sErawNIgCi3HMsTIpJ34ybU1j8di0reakOSRT7rWyWRe7rtaSialvFldX-thnmRO-kkNf1cHYkuOpMqrNMmnjj7tiKsed7Em5wXU5FZOSck4wniLo3EJZO1TJBIJpWRyIb8shd8os3eMuW0w",
    description: "Liquid Cooling System",
    category: "Coolers",
  },
  {
    id: "3",
    name: "Titan Smartwatch",
    brand: "TitanTech",
    price: 199,
    rating: 4.9,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1BPv0IW16BXiy2Rq_ZBes1iU7AXD7z7piUigZBYNQ4M-upqKkFBOpcCVPZMEJ42XikzqejX3evfiyeP3vLoliYl4VBL2CNpbVA-OtaWo9VNR1Ofq9aeg6Tgjab_-TG_syp1C3WCMRjtVkU8yqFBe7LCokitI9FSwrErWFKzRsM9rKyTVZjQMefRnu10LjO-t6fPaEbQzs3Yxo5h0868sCnSLKYNH1R4PFDcuPaQv08N4dzfVdiz_jcajetArP9ovENjTGrKihA",
    description: "OLED Retina Display",
    category: "Wearables",
  },
  {
    id: "4",
    name: "Neon Keyboard",
    brand: "RazerX",
    price: 129,
    rating: 4.7,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5Lc54W-MpJG4Rm7TBtVoo4ceEG1e9NZU9NOkjZrlKSFBBn7xf2rrDiB_UiLkg-RVS14audwgENgpjl1S-NirtsymFJsNNMVgj9C7RHrz99N1jtLORAzEpuzS3hPxl093qcTNQmlHTurtkI21qOUH6NDIl0UsLQJ6DdYZL3lHVFr8D_Qtlz1N-TIMwZzbiXhb8CLZkX9yT6GUbVzOWAoIrm7fbZOuBhIhxJcNky1eWlZ9Km1q3U3rbv6Dy9rUUtokBlG9kyw9Jtg",
    description: "Mechanical RGB",
    category: "Gaming",
  },
  {
    id: "5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    price: 348,
    rating: 4.9,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9jXqXvPRD3sfHd3-5DrplfyOjaJ1nwPzPNdudA2h-p_rnczhjyetnsgOPkdrbRB6EETommYZ4oE_bh4xe0kATd3PkBg2kZHK6PhPxwbHgu_zTxPn_w0PSKA5bP6QRpC4GYrzW-ncQ6vhqX84fzx8WN6i8wCQg1iUsu-uXhDv1MtfUXF109W4yhAHV7eA3qKPWhb5hUZQL2D5nOAw9JFvqnCIKG2ss8t3s8htC0EsDUh-xAFsjYt-pUixL8wwuktl4xxi3XrBYJg",
    description: "Noise Canceling",
    category: "Headphones",
  },
  {
    id: "6",
    name: "AirPods Max",
    brand: "Apple",
    price: 549,
    rating: 4.8,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM7oYTFj86re6fuX8YoUdfAHnJDz6BYAIa7Fy_XRqlvSjAwLywygPfmKt9fGgCkqXn0daUGFmYqphNg2cUbjjzKjEz4q3RbOYVaOuu0UuRTnx-IVSHrEBaSObL8UafUIFOIET104cIgEVGtcN_STFrzpDcP2TzbKJgnkNfQvFj9bAvG3LXnJQcBzKSSlJ1v0E7V9ssWvcZq4SiihWJyqw4ObVvLN6_k7-kiDAGhqQZp1uaALMgKSV8Afb-0ifvRnuwswqPdYt4DQ",
    description: "Silver",
    category: "Headphones",
  },
  {
    id: "7",
    name: "Nothing Ear (2)",
    brand: "Nothing",
    price: 149,
    rating: 4.6,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1E-2YB7H5lslNqGe1fLLzIN2HCcKwpqNy3Fns6mZO-O4pLEpMrMSx67l7G2Vg49ySbh42wxE5aWwuhOpfgVuS_bgdLv5MmWPZQzR1mPdpzkfI3RoXTBmNPxEg48G_K7tZwxPqpT_hl-x3dpDSFl_19ppQrYrIaPQ4v7LWEUYIHgTa99aPh-F3SbLi43qyS9T7lJiDDQF1Ce7AqbXFelBIv06zBc2UQ9e3evMqWCs1PUTa7XBAlItpctn6IXqmxuHSJY9r-_dKMA",
    description: "Wireless",
    category: "Headphones",
  },
  {
    id: "8",
    name: "Momentum 4",
    brand: "Sennheiser",
    price: 299.95,
    rating: 4.7,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIkCDW3qurYH8SKvsGcM0M2o48JGrKk3YTu1Ai_7jsqlHX6WHIKUWvNLt_TMgxXiTGRwq4DD1FYy0Md6wyPhdT7yAJo4inrgcWJHjOfkU_Mp8XPggw9vOca7xTV--o4Sdl6ke1RbDxCP9ybqVhaHUtXyZS3qqh-HBVPd3XR091IkRbGuNJDyUdy2tLg846y3t4thgZWRF7C2TITxN5G1QKknVZsJEtdqDIuDnC5w3Yym0oJ_ucq0N8vQBdAycbOE4e4TvYbAauAQ",
    description: "Wireless",
    category: "Headphones",
  },
];
