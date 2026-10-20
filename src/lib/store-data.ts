import korean from "@/assets/cat-korean.jpg";
import unisex from "@/assets/cat-unisex.jpg";
import women from "@/assets/cat-women.jpg";
import imported from "@/assets/cat-imported.jpg";
import shirt from "@/assets/p-shirt.jpg";
import denim from "@/assets/p-denim.jpg";
import knit from "@/assets/p-knit.jpg";
import hero from "@/assets/hero.jpg";
import blouse from "@/assets/p-blouse.jpg";
import tee from "@/assets/p-tee.jpg";
import satin from "@/assets/p-satin.jpg";
import bomber from "@/assets/p-bomber.jpg";

/**
 * EDITABLE CONFIG. Set WHATSAPP_NUMBER to the confirmed WhatsApp-enabled
 * number in international format without "+" (e.g. "919XXXXXXXXX").
 * While empty, WhatsApp buttons are hidden and call links are shown instead.
 */
export const WHATSAPP_NUMBER = "";

export const INSTAGRAM_URL = "https://www.instagram.com/db_hub_cloth_store/";
export const PHONES = ["9345926694", "9363034644"];

export const STORES = [
  {
    city: "Chennai",
    address: "Loc Square, Pycrofts Road, Narayana Krishnaraja Puram, Triplicane, Chennai, Tamil Nadu 600005",
    phone: "9345926694",
  },
  {
    city: "Coimbatore",
    address: "Brindhavan Circle, Kuniyamuthur, Coimbatore, Tamil Nadu 641008",
    phone: "9363034644",
  },
];

export const mapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

export const whatsappUrl = (text: string) =>
  WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}` : null;

export type CategoryId = "korean" | "unisex" | "women" | "imported";

export const CATEGORIES: { id: CategoryId; name: string; note: string; img: string }[] = [
  { id: "korean", name: "Korean Edit", note: "Soft tailoring & layered knits", img: korean },
  { id: "unisex", name: "Unisex Collection", note: "Oversized fits for everyone", img: unisex },
  { id: "women", name: "Women's Wear", note: "Dresses, sets & everyday pieces", img: women },
  { id: "imported", name: "Imported & Surplus", note: "Rotating finds, great value", img: imported },
];

export type Product = {
  id: string; name: string; category: CategoryId; price: number; mrp: number; sizes: string[]; img: string; desc: string;
};

export const discountPct = (p: Product) =>
  p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

/** DEMO DATA — names, prices and discounts are placeholders, not real stock or pricing. */
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Oversized Linen Shirt", category: "unisex", price: 799, mrp: 1199, sizes: ["S", "M", "L", "XL"], img: shirt, desc: "Relaxed drop-shoulder linen-look shirt in cream." },
  { id: "p2", name: "Washed Denim Jacket", category: "imported", price: 1299, mrp: 1799, sizes: ["M", "L", "XL"], img: denim, desc: "Classic trucker silhouette in mid-wash denim." },
  { id: "p3", name: "Cable Vest & Pleat Set", category: "korean", price: 1499, mrp: 1999, sizes: ["S", "M", "L"], img: knit, desc: "Burgundy cable-knit vest paired with a satin pleated skirt." },
  { id: "p4", name: "Square-Neck Midi Dress", category: "women", price: 1199, mrp: 1599, sizes: ["S", "M", "L", "XL"], img: women, desc: "Burgundy midi with puff sleeves and fitted bodice." },
  { id: "p5", name: "Cropped Knit Cardigan", category: "korean", price: 899, mrp: 1299, sizes: ["S", "M", "L"], img: korean, desc: "Soft cream cardigan with pearl-tone buttons." },
  { id: "p6", name: "Fleece Hoodie & Cargo", category: "unisex", price: 1599, mrp: 2199, sizes: ["M", "L", "XL"], img: unisex, desc: "Heavyweight hoodie with wide cargo trousers." },
  { id: "p7", name: "Surplus Knit Bundle", category: "imported", price: 999, mrp: 1399, sizes: ["Free size"], img: imported, desc: "Assorted imported knits — styles vary by lot." },
  { id: "p8", name: "Tailored Wide Suit", category: "women", price: 2199, mrp: 2899, sizes: ["S", "M", "L", "XL"], img: hero, desc: "Oversized blazer with pleated wide-leg trousers." },
  { id: "p9", name: "Blush Poplin Shirt & Wide Pant", category: "korean", price: 1399, mrp: 1899, sizes: ["S", "M", "L"], img: blouse, desc: "Pastel pink oversized shirt with cream pleated trousers." },
  { id: "p10", name: "Graphic Tee & Baggy Jeans", category: "unisex", price: 1099, mrp: 1599, sizes: ["S", "M", "L", "XL"], img: tee, desc: "Washed black graphic tee with relaxed wide-leg denim." },
  { id: "p11", name: "Satin Shirt Co-ord", category: "women", price: 1799, mrp: 2499, sizes: ["S", "M", "L", "XL"], img: satin, desc: "Burgundy satin shirt and flowing wide-leg pants." },
  { id: "p12", name: "Olive Bomber Jacket", category: "imported", price: 1499, mrp: 2199, sizes: ["M", "L", "XL"], img: bomber, desc: "Imported nylon bomber with sleeve zip pocket." },
];

export const GALLERY = [hero, korean, knit, unisex, denim, women];
