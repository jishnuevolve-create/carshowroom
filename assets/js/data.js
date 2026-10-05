/**
 * Royal Drive — inventory data.
 * In production this would come from a CMS / DMS / Supabase table with the same shape.
 * Images are Unsplash placeholders — replace `img` with your own studio photos.
 */
(function () {
  const U = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;

  // Shared detail shots used to pad galleries until real photo sets are uploaded.
  const DETAIL = ["1484136540910-d66bb475348d", "1493238792000-8113da705763", "1568605117036-5fe5e7bab0b7"];

  const BASE_FEATURES = [
    "ABS with EBD", "6 Airbags", "Rear Parking Camera", "Cruise Control", "Apple CarPlay & Android Auto",
    "Automatic Climate Control", "Keyless Entry & Push Start", "LED Headlamps", "Alloy Wheels",
  ];

  const cars = [
    { id: "bmw-330li-m-sport-2022", brand: "BMW", model: "3 Series Gran Limousine", variant: "330Li M Sport", year: 2022, km: 28400, fuel: "Petrol", transmission: "Automatic", owners: 1, price: 4650000, body: "Sedan", badge: "Certified", img: "1555215695-3004980ad54e", color: "Alpine White", engine: "1998 cc, 4-cyl Turbo", power: "258 hp", efficiency: "15.4 kmpl", seats: 5, reg: "KA-03", insurance: "Comprehensive · Mar 2027", service: "BMW authorised · 5 visits", score: 96, extra: ["Panoramic Sunroof", "Harman Kardon Audio", "Gesture Control", "Ambient Lighting", "Wireless Charging", "Memory Seats"] },
    { id: "mercedes-c220d-2021", brand: "Mercedes-Benz", model: "C-Class", variant: "C 220d Progressive", year: 2021, km: 36200, fuel: "Diesel", transmission: "Automatic", owners: 1, price: 4290000, body: "Sedan", badge: "Certified", img: "1570733577524-3a047079e80d", color: "Selenite Grey", engine: "1993 cc, 4-cyl Diesel", power: "194 hp", efficiency: "16.9 kmpl", seats: 5, reg: "KA-05", insurance: "Comprehensive · Jan 2027", service: "Mercedes authorised · 6 visits", score: 94, extra: ["Burmester Audio", "64-colour Ambient Lighting", "Electric Sunroof", "Powered Front Seats", "Digital Driver Display"] },
    { id: "audi-a6-45tfsi-2022", brand: "Audi", model: "A6", variant: "45 TFSI Technology", year: 2022, km: 19800, fuel: "Petrol", transmission: "Automatic", owners: 1, price: 5175000, body: "Sedan", badge: "Just Arrived", img: "1616422285623-13ff0162193c", color: "Floret Silver", engine: "1984 cc, 4-cyl Turbo", power: "245 hp", efficiency: "14.1 kmpl", seats: 5, reg: "KA-01", insurance: "Comprehensive · Jun 2027", service: "Audi authorised · 4 visits", score: 97, extra: ["Virtual Cockpit Plus", "Bang & Olufsen 3D Audio", "Matrix LED", "4-zone Climate", "Park Assist"] },
    { id: "porsche-911-carrera-s-2019", brand: "Porsche", model: "911", variant: "Carrera S (992)", year: 2019, km: 21500, fuel: "Petrol", transmission: "Automatic", owners: 2, price: 14500000, body: "Coupe", badge: "Certified", img: "1614162692292-7ac56d7f7f1e", color: "Carrara White", engine: "2981 cc, Flat-6 Twin Turbo", power: "450 hp", efficiency: "9.2 kmpl", seats: 4, reg: "KA-51", insurance: "Comprehensive · Nov 2026", service: "Porsche Centre · 5 visits", score: 95, extra: ["Sport Chrono Package", "PASM Sport Suspension", "Bose Surround Sound", "Sport Exhaust", "Adaptive Sport Seats Plus"] },
    { id: "audi-rs7-sportback-2021", brand: "Audi", model: "RS 7 Sportback", variant: "4.0 TFSI quattro", year: 2021, km: 16200, fuel: "Petrol", transmission: "Automatic", owners: 1, price: 13800000, body: "Sedan", badge: "Just Arrived", img: "1606152421802-db97b9c7a11b", color: "Nardo Grey", engine: "3996 cc, V8 Twin Turbo", power: "600 hp", efficiency: "8.1 kmpl", seats: 5, reg: "KA-03", insurance: "Comprehensive · Aug 2027", service: "Audi authorised · 3 visits", score: 98, extra: ["RS Sport Exhaust", "Ceramic Brakes", "RS Adaptive Air Suspension", "Bang & Olufsen 3D Audio", "Head-up Display", "Matrix LED Laser Lights"] },
    { id: "tesla-model-3-long-range-2023", brand: "Tesla", model: "Model 3", variant: "Long Range AWD", year: 2023, km: 9800, fuel: "Electric", transmission: "Automatic", owners: 1, price: 5450000, body: "Sedan", badge: "Just Arrived", img: "1606016159991-dfe4f2746ad5", color: "Pearl White", engine: "82 kWh Battery", power: "440 hp", efficiency: "629 km range (WLTP)", seats: 5, reg: "KA-53", insurance: "Comprehensive · Apr 2027", service: "Tesla Service · 2 visits", score: 98, extra: ["Battery Health 99%", "Autopilot", "Glass Roof", "15\" Touchscreen", "Premium Audio", "Wall Connector Included"] },
    { id: "tesla-model-3-rwd-2022", brand: "Tesla", model: "Model 3", variant: "Rear-Wheel Drive", year: 2022, km: 21300, fuel: "Electric", transmission: "Automatic", owners: 1, price: 4250000, body: "Sedan", badge: "Certified", img: "1560958089-b8a1929cea89", color: "Pearl White", engine: "60 kWh LFP Battery", power: "283 hp", efficiency: "491 km range (WLTP)", seats: 5, reg: "KA-01", insurance: "Comprehensive · Feb 2027", service: "Tesla Service · 3 visits", score: 96, extra: ["Battery Health 97%", "Autopilot", "Glass Roof", "Heated Seats", "Phone-as-Key"] },
    { id: "jeep-grand-cherokee-2022", brand: "Jeep", model: "Grand Cherokee", variant: "Limited (O) 4x4", year: 2022, km: 31500, fuel: "Petrol", transmission: "Automatic", owners: 1, price: 5850000, body: "SUV", badge: "Certified", img: "1563720223185-11003d516935", color: "Diamond Black", engine: "1995 cc, 4-cyl Turbo", power: "272 hp", efficiency: "10.2 kmpl", seats: 5, reg: "KA-04", insurance: "Comprehensive · Feb 2027", service: "Jeep authorised · 4 visits", score: 93, extra: ["Quadra-Trac 4x4", "McIntosh Audio", "Air Suspension", "Ventilated Seats", "ADAS Suite"] },
    { id: "toyota-fortuner-legender-2022", brand: "Toyota", model: "Fortuner", variant: "Legender 4x4 AT", year: 2022, km: 42800, fuel: "Diesel", transmission: "Automatic", owners: 1, price: 4290000, body: "SUV", badge: "Certified", img: "1617469767053-d3b523a0b982", color: "Platinum Pearl", engine: "2755 cc, 4-cyl Diesel", power: "201 hp", efficiency: "11.9 kmpl", seats: 7, reg: "KA-02", insurance: "Comprehensive · Dec 2026", service: "Toyota authorised · 7 visits", score: 95, extra: ["4WD with Low Range", "Kick Sensor Tailgate", "Wireless Charging", "Ventilated Seats", "JBL Audio"] },
    { id: "volvo-xc60-b5-2021", brand: "Volvo", model: "XC60", variant: "B5 Inscription", year: 2021, km: 33600, fuel: "Petrol", transmission: "Automatic", owners: 1, price: 4750000, body: "SUV", badge: "Certified", img: "1519641471654-76ce0107ad1b", color: "Crystal White", engine: "1969 cc, Mild Hybrid", power: "250 hp", efficiency: "11.2 kmpl", seats: 5, reg: "KA-01", insurance: "Comprehensive · Sep 2027", service: "Volvo authorised · 5 visits", score: 96, extra: ["Bowers & Wilkins Audio", "Pilot Assist ADAS", "Panoramic Sunroof", "Air Purifier", "Massage Seats"] },
    { id: "ford-mustang-gt-2019", brand: "Ford", model: "Mustang", variant: "GT 5.0 V8", year: 2019, km: 18900, fuel: "Petrol", transmission: "Automatic", owners: 2, price: 6250000, body: "Coupe", badge: "Certified", img: "1494976388531-d1058494cdd8", color: "Shadow Black", engine: "4951 cc, V8", power: "401 hp", efficiency: "7.8 kmpl", seats: 4, reg: "KA-05", insurance: "Comprehensive · Oct 2026", service: "Ford authorised · 6 visits", score: 92, extra: ["Active Valve Exhaust", "Line-Lock & Launch Control", "Shaker Pro Audio", "Ventilated Leather Seats", "Track Apps"] },
    { id: "mini-cooper-s-2020", brand: "MINI", model: "Cooper S", variant: "3-Door", year: 2020, km: 26400, fuel: "Petrol", transmission: "Automatic", owners: 1, price: 2750000, body: "Hatchback", badge: "Certified", img: "1549317661-bd32c8ce0db2", color: "Pastel Blue", engine: "1998 cc, 4-cyl Turbo", power: "192 hp", efficiency: "16.7 kmpl", seats: 4, reg: "KA-03", insurance: "Comprehensive · May 2027", service: "MINI authorised · 4 visits", score: 94, extra: ["Harman Kardon Audio", "Panoramic Sunroof", "Head-up Display", "Sport Mode", "Union Jack Tail Lamps"] },
    { id: "vw-polo-gt-tsi-2021", brand: "Volkswagen", model: "Polo", variant: "GT TSI DSG", year: 2021, km: 38600, fuel: "Petrol", transmission: "Automatic", owners: 1, price: 795000, body: "Hatchback", badge: "Certified", img: "1541899481282-d53bffe3c35d", color: "Lapiz Blue", engine: "999 cc, 3-cyl TSI", power: "109 hp", efficiency: "17.2 kmpl", seats: 5, reg: "KA-01", insurance: "Comprehensive · Jan 2027", service: "VW authorised · 6 visits", score: 93, extra: ["7-speed DSG", "Climatronic AC", "Rain-sensing Wipers", "Cornering Lamps"] },
    { id: "skoda-slavia-1-5-tsi-2023", brand: "Skoda", model: "Slavia", variant: "1.5 TSI Style DSG", year: 2023, km: 15200, fuel: "Petrol", transmission: "Automatic", owners: 1, price: 1395000, body: "Sedan", badge: "Just Arrived", img: "1502877338535-766e1452684a", color: "Lava Blue", engine: "1498 cc, 4-cyl TSI", power: "148 hp", efficiency: "19.4 kmpl", seats: 5, reg: "KA-04", insurance: "Comprehensive · Jul 2027", service: "Skoda authorised · 3 visits", score: 97, extra: ["Ventilated Front Seats", "Electric Sunroof", "Virtual Cockpit", "Wireless Charging"] },
    { id: "toyota-camry-hybrid-2021", brand: "Toyota", model: "Camry", variant: "Hybrid", year: 2021, km: 41000, fuel: "Hybrid", transmission: "Automatic", owners: 1, price: 3150000, body: "Sedan", badge: "Certified", img: "1619682817481-e994891cd1f5", color: "Platinum White Pearl", engine: "2487 cc, Hybrid", power: "218 hp", efficiency: "19.1 kmpl", seats: 5, reg: "KA-51", insurance: "Comprehensive · Mar 2027", service: "Toyota authorised · 6 visits", score: 95, extra: ["Reclining Rear Seats", "JBL 9-speaker Audio", "3-zone Climate", "Head-up Display", "Rear Sunshade"] },
    { id: "bmw-m340i-xdrive-2022", brand: "BMW", model: "3 Series", variant: "M340i xDrive", year: 2022, km: 17400, fuel: "Petrol", transmission: "Automatic", owners: 1, price: 6450000, body: "Sedan", badge: "Just Arrived", img: "1580273916550-e323be2ae537", color: "Dravit Grey", engine: "2998 cc, 6-cyl Turbo", power: "374 hp", efficiency: "11.8 kmpl", seats: 5, reg: "KA-03", insurance: "Comprehensive · Jun 2027", service: "BMW authorised · 3 visits", score: 97, extra: ["M Sport Differential", "Adaptive M Suspension", "Laser Light", "Harman Kardon Audio", "Head-up Display"] },
  ];

  const AREAS = ["Engine & Transmission", "Body & Paint", "Electricals", "Suspension & Brakes", "Interior", "Tyres"];

  cars.forEach((c, i) => {
    c.title = `${c.brand} ${c.model}`;
    c.name = `${c.year} ${c.brand} ${c.model} ${c.variant}`;
    c.image = U(c.img, 900);
    c.thumb = U(c.img, 160);
    c.gallery = [c.img, ...DETAIL].map((id, n) => ({ src: U(id, 1400), thumb: U(id, 240), alt: `${c.name} — photo ${n + 1}` }));
    c.features = [...c.extra, ...BASE_FEATURES];
    c.luxury = c.price >= 4000000;
    c.budget = c.price < 1500000;
    c.added = i; // lower = newer listing
    c.inspection = AREAS.map((area, n) => ({ area, score: Math.min(100, c.score - 4 + ((i + n * 3) % 7)) }));
  });

  window.RD_CARS = cars;
  window.RD_CATEGORIES = [
    { key: "SUV", label: "SUV", note: "Space & presence", img: U("1563720223185-11003d516935", 600) },
    { key: "Sedan", label: "Sedan", note: "Refined comfort", img: U("1570733577524-3a047079e80d", 600) },
    { key: "Hatchback", label: "Hatchback", note: "City smart", img: U("1541899481282-d53bffe3c35d", 600) },
    { key: "luxury", label: "Luxury", note: "₹40L and above", img: U("1631295868223-63265b40d9e4", 600) },
    { key: "Electric", label: "Electric", note: "Zero emissions", img: U("1560958089-b8a1929cea89", 600) },
    { key: "budget", label: "Budget Cars", note: "Under ₹15 Lakh", img: U("1549317661-bd32c8ce0db2", 600) },
  ];
  window.RD_IMG = U;
})();
