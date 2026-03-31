import { storage } from './src/lib/storage';

async function uploadBanners() {
  const settings = await storage.getSettings();
  
  const banners = [
    {
      id: "1",
      title: "Rajshahi Premium Himsagar Mango",
      description: "Sweet, golden, and farm-fresh. Direct from the orchard.",
      imageUrl: "/images/banner_mango_orchard_1774891563889.png",
      linkUrl: "/shop?category=Premium Mango"
    },
    {
      id: "2",
      title: "Egyptian Medjool Dates",
      description: "Rich, dark, and luxurious. Perfect for your healthy lifestyle.",
      imageUrl: "/images/banner_premium_dates_1774891658686.png",
      linkUrl: "/shop?category=Premium Dates"
    },
    {
      id: "3",
      title: "Organic Berries Combo",
      description: "Fresh, vibrant, and bursting with nutrients.",
      imageUrl: "/images/banner_organic_berries_1774891727795.png",
      linkUrl: "/shop?category=Organic Combo"
    }
  ];

  await storage.updateSettings({ ...settings, banners });
  console.log("Successfully uploaded banners to current environment storage!");
}

uploadBanners().catch(console.error);
