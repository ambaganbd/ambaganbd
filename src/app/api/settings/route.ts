export const dynamic = 'force-dynamic';
import { verifyAdmin } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

import { revalidatePath } from 'next/cache';

const defaultSettings = {
  storeName: "Am Bagan BD",
  logoUrl: "/logo.png",
  contactEmail: "ambaganbd24@gmail.com",
  contactPhone: "+880 1XXXXXXXXX",
  contactAddress: "Rajshahi, Bangladesh",
  shortDescription: "Your premium destination for authentic, orchard-fresh mangoes and seasonal fruits direct from Rajshahi.",
  currencySymbol: "৳",
  themeId: "mango",
  announcementText: "Fresh Mango Season is Live! 🥭",
  announcementActive: true,
  navLinks: [],
  banners: [],
  categories: [],
  socialLinks: [],
  footerProducts: [],
  footerCompany: [],
  paymentMethods: [
    { id: "1", name: "bKash", accountNumber: "", enabled: true },
    { id: "2", name: "Nagad", accountNumber: "", enabled: true },
  ],
  codEnabled: true,
  deliveryCharge: 0,
};

export async function GET() {
  let settings = await storage.getSettings();
  
  // If settings empty or invalid
  if (!settings || Object.keys(settings).length === 0 || Array.isArray(settings)) {
    settings = defaultSettings;
    await storage.updateSettings(settings); // Seed
  }
  
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const data = await request.json();
    const settings = await storage.getSettings();
    
    const updatedSettings = { ...settings, ...data };
    await storage.updateSettings(updatedSettings);
    
    // Recalculate home page and contact page
    revalidatePath("/");
    revalidatePath("/contact");
    
    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    console.error("Firebase settings save error:", error);
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}
