export type Product = {
  id: string;
  name: string;
  price: string;
  img: string | null;
  category: string;
  description: string;
};

export const allProducts: Product[] = [
  { id: "1", name: "Rainbow Tulip Charm", price: "₱200.00", img: "/Rainbow Tulip Charm.png", category: "bouquet", description: "A cheerful mix of colorful tulips crafted with love. Perfect as a gift or home decoration. Each petal is carefully crocheted to bring a burst of color to any space." },
  { id: "2", name: "Pastel Blossom Bouquet", price: "₱250.00", img: "/Pastel Blossom Bouquet.png", category: "bouquet", description: "Soft pastel blooms that bring a gentle and sweet vibe. Ideal for birthdays, anniversaries, or just to brighten someone's day." },
  { id: "3", name: "Lavender Bell Flowers", price: "₱300.00", img: "/Lavender Bell Flowers.png", category: "bouquet", description: "Elegant lavender bells with a calming and romantic feel. A timeless piece that adds elegance to any room or occasion." },
  { id: "4", name: "Mini White Pastel Flower Bouquet", price: "₱150.00", img: "/Mini White Pastel Flower Bouquet.png", category: "bouquet", description: "A cute mini bouquet of white pastel flowers, simple yet lovely. Great as a small gift or desk decoration." },
  { id: "5", name: "Pink Star Lily Bloom", price: "₱200.00", img: null, category: "bouquet", description: "A stunning pink star lily bloom handcrafted with premium yarn. A unique and eye-catching piece for any occasion." },
  { id: "6", name: "Pastel Twin Tulips", price: "₱250.00", img: null, category: "bouquet", description: "Two beautiful pastel tulips paired together in a charming arrangement. Perfect for couples or best friends." },
  { id: "7", name: "Pure White Rosebud", price: "₱300.00", img: null, category: "bouquet", description: "A delicate pure white rosebud that symbolizes new beginnings and pure love. A timeless classic." },
  { id: "8", name: "Pink Tulip Delight", price: "₱150.00", img: null, category: "bouquet", description: "A delightful pink tulip arrangement that radiates warmth and joy. Perfect for any celebration." },
  { id: "9", name: "Graduation Penguin", price: "₱80.00", img: "/Graduation Penguin.png", category: "keychain", description: "An adorable graduation penguin keychain — perfect gift for graduates! Handcrafted with soft yarn and lots of love." },
  { id: "10", name: "Frog-Hat", price: "₱90.00", img: "/Frog-Hat.png", category: "keychain", description: "A cute frog wearing a tiny hat! This charming keychain will make everyone smile wherever you go." },
  { id: "11", name: "Strawberry-Hat Creature", price: "₱100.00", img: "/Strawberry-Hat Creature.png", category: "keychain", description: "A whimsical strawberry-hat creature that's both unique and adorable. A must-have for kawaii lovers." },
  { id: "12", name: "Purple Bow", price: "₱95.00", img: "/Purple Bow.png", category: "keychain", description: "A sweet purple bow keychain that adds a touch of elegance to your keys or bag." },
  { id: "13", name: "Monkey D. Luffy", price: "₱110.00", img: "/Monkey D. Luffy.png", category: "keychain", description: "A handcrafted Monkey D. Luffy keychain for One Piece fans! Show your love for the future King of the Pirates." },
  { id: "14", name: "Teddy Bear", price: "₱75.00", img: "/Teddy Bear.png", category: "keychain", description: "A classic teddy bear keychain that never goes out of style. Soft, cute, and perfect for all ages." },
  { id: "15", name: "Sweet Bow Keychain", price: "₱88.00", img: "/Sweet Bow Keychain.png", category: "keychain", description: "A sweet and simple bow keychain that pairs well with any bag or keys. Minimalist yet charming." },
  { id: "16", name: "Kuromi (Head Only)", price: "₱88.00", img: "/Kuromi (Head Only).png", category: "keychain", description: "Kuromi's iconic head as a keychain! Perfect for Sanrio fans who love the edgy yet cute aesthetic." },
  { id: "17", name: "Kuromi (Full Body)", price: "₱88.00", img: "/Kuromi (Full Body).png", category: "keychain", description: "Full body Kuromi keychain with all her iconic details. A collector's item for true Sanrio fans." },
  { id: "18", name: "Brown Teddy Bear", price: "₱75.00", img: "/Brown Teddy Bear.png", category: "keychain", description: "A warm brown teddy bear keychain that feels like a tiny hug. Perfect as a gift for loved ones." },
];
