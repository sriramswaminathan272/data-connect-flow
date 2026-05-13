/**
 * QuickCart Data Warehouse — Synthetic Data Generator
 *
 * Generates realistic sample data for all raw tables.
 * Maintains referential integrity (FK relationships) and realistic distributions.
 *
 * Usage:
 *   npm run generate-warehouse              # dev mode: 10K orders
 *   npm run generate-warehouse -- --scale=full  # full: 5L orders, 2Cr events
 *
 * Output: CSV files in simulation/data-warehouse/quickcart/data/
 * Runtime: ~2 min (dev), ~25 min (full)
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "data");
mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Scale config ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const FULL_SCALE = args.includes("--scale=full");

const SCALE = FULL_SCALE ? {
  users:            1_000_000,   // 10 lakh users
  sellers:            100_000,   // 1 lakh sellers
  products:         5_000_000,   // 50 lakh products
  categories:           2_500,
  orders:             500_000,   // 5 lakh orders
  sessions:         2_000_000,   // 2 crore sessions
  events:          50_000_000,   // 5 crore events (sampled)
  warehouses:             350,
  campaigns:            5_000,
  search_queries:   3_000_000,
  experiments:            120,
} : {
  users:             10_000,
  sellers:            2_000,
  products:          50_000,
  categories:         2_500,
  orders:            10_000,
  sessions:          50_000,
  events:           200_000,
  warehouses:            50,
  campaigns:            200,
  search_queries:    50_000,
  experiments:           20,
};

// ── Seeded RNG ────────────────────────────────────────────────────────────────

class SeededRng {
  private seed: number;
  constructor(seed = 42) { this.seed = seed; }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(this.seed) / 0x80000000;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  float(min: number, max: number, dp = 2): number {
    return parseFloat((this.next() * (max - min) + min).toFixed(dp));
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  weighted<T>(items: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  // Log-normal distribution for GMV / prices (realistic long-tail)
  logNormal(mu: number, sigma: number): number {
    const u1 = this.next(), u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.exp(mu + sigma * z);
  }

  uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const v = c === "x" ? this.int(0, 15) : (this.int(8, 11));
      return v.toString(16);
    });
  }

  date(start: Date, end: Date): Date {
    const ms = start.getTime() + this.next() * (end.getTime() - start.getTime());
    return new Date(ms);
  }

  isoTs(start: Date, end: Date): string {
    return this.date(start, end).toISOString().replace("T", " ").slice(0, 19);
  }
}

const rng = new SeededRng(42);

// ── Reference data ────────────────────────────────────────────────────────────

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
  "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
  "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
  "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Coimbatore",
];

const STATE_BY_CITY: Record<string, string> = {
  Mumbai: "Maharashtra", Pune: "Maharashtra", Thane: "Maharashtra",
  Delhi: "Delhi", Ghaziabad: "Uttar Pradesh", Faridabad: "Haryana",
  Bengaluru: "Karnataka", Hyderabad: "Telangana", Chennai: "Tamil Nadu",
  Kolkata: "West Bengal", Ahmedabad: "Gujarat", Surat: "Gujarat",
  Jaipur: "Rajasthan", Lucknow: "Uttar Pradesh", Kanpur: "Uttar Pradesh",
  Nagpur: "Maharashtra", Indore: "Madhya Pradesh", Bhopal: "Madhya Pradesh",
  Visakhapatnam: "Andhra Pradesh", Patna: "Bihar", Ludhiana: "Punjab",
  Agra: "Uttar Pradesh", Nashik: "Maharashtra", Meerut: "Uttar Pradesh",
  Rajkot: "Gujarat", Coimbatore: "Tamil Nadu",
};

const L1_CATEGORIES = [
  "Electronics", "Fashion", "Home & Furniture", "Beauty", "Sports",
  "Books", "Toys", "Grocery", "Automotive", "Healthcare",
];

const L2_BY_L1: Record<string, string[]> = {
  Electronics:       ["Mobiles", "Laptops", "Tablets", "Cameras", "TV & Appliances", "Wearables", "Audio"],
  Fashion:           ["Men's Clothing", "Women's Clothing", "Footwear", "Accessories", "Jewellery", "Kids Wear"],
  "Home & Furniture":["Furniture", "Decor", "Kitchen", "Bedding", "Lighting", "Storage"],
  Beauty:            ["Skincare", "Haircare", "Makeup", "Fragrances", "Personal Care"],
  Sports:            ["Cricket", "Football", "Fitness Equipment", "Yoga", "Cycling", "Running"],
  Books:             ["Academic", "Fiction", "Non-fiction", "Comics", "Children"],
  Toys:              ["Action Figures", "Board Games", "STEM Toys", "Outdoor", "Dolls"],
  Grocery:           ["Staples", "Snacks", "Beverages", "Personal Care", "Cleaning"],
  Automotive:        ["Car Accessories", "Bike Accessories", "Tools", "Lubricants"],
  Healthcare:        ["Medicines", "Medical Devices", "Supplements", "Wellness"],
};

const PAYMENT_METHODS = ["upi", "card", "netbanking", "cod", "emi", "wallet", "bnpl"];
const PAYMENT_WEIGHTS = [40, 20, 10, 18, 6, 4, 2];

const ACQUISITION_CHANNELS = ["organic", "google_ads", "meta", "referral", "influencer", "email"];
const CHANNEL_WEIGHTS       = [30, 25, 20, 15, 7, 3];

const RETURN_REASONS = [
  "wrong_item", "damaged", "quality_issue", "size_mismatch",
  "not_as_described", "changed_mind", "other",
];
const RETURN_WEIGHTS = [8, 10, 15, 20, 25, 18, 4];

const COURIERS = ["ekart", "bluedart", "delhivery", "xpressbees", "shadowfax"];
const SELLER_TIERS = ["gold", "silver", "bronze"];
const TIER_WEIGHTS = [5, 20, 75];

// ── CSV helpers ───────────────────────────────────────────────────────────────

function writeCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) { console.log(`  ${filename}: 0 rows`); return; }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map(r =>
      headers.map(h => {
        const v = r[h];
        if (v === null || v === undefined) return "";
        const s = String(v);
        return s.includes(",") || s.includes('"') || s.includes("\n")
          ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(",")
    ),
  ];
  const path = join(OUTPUT_DIR, filename);
  writeFileSync(path, lines.join("\n"), "utf-8");
  console.log(`  ${filename}: ${rows.length.toLocaleString()} rows → ${path}`);
}

// ── Generators ────────────────────────────────────────────────────────────────

const START_DATE = new Date("2023-01-01");
const END_DATE   = new Date("2024-07-15");
const LOADED_AT  = "2024-07-15 02:00:00";

function generateCategories(): { category_id: string; l1: string; l2: string }[] {
  const cats: { category_id: string; l1: string; l2: string; level: number;
                parent_id: string | null; name: string; path: string }[] = [];

  for (const l1 of L1_CATEGORIES) {
    const l1Id = `cat_${rng.int(1000, 9999)}`;
    cats.push({ category_id: l1Id, l1, l2: l1, level: 1, parent_id: null,
                name: l1, path: l1 });
    for (const l2 of (L2_BY_L1[l1] ?? [])) {
      const l2Id = `cat_${rng.int(10000, 99999)}`;
      cats.push({ category_id: l2Id, l1, l2, level: 2, parent_id: l1Id,
                  name: l2, path: `${l1}/${l2}` });
    }
  }
  return cats;
}

function generateWarehouses(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const city = rng.pick(CITIES);
    return {
      warehouse_id: `wh_${String(i + 1).padStart(5, "0")}`,
      name: `QuickCart ${city} ${rng.pick(["FC", "Sort Hub", "Delivery Hub"])} ${i + 1}`,
      city,
      state: STATE_BY_CITY[city] ?? "Unknown",
      pincode: String(rng.int(100000, 999999)),
      type: rng.pick(["fulfilment_centre", "sort_hub", "delivery_hub"]),
      capacity_sqft: rng.int(10000, 500000),
      is_active: rng.next() > 0.05 ? "true" : "false",
      _loaded_at: LOADED_AT,
    };
  });
}

function generateSellers(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const city = rng.pick(CITIES);
    const tier = rng.weighted(SELLER_TIERS, TIER_WEIGHTS);
    return {
      seller_id: `sel_${String(i + 1).padStart(8, "0")}`,
      display_name: `Seller ${i + 1} Store`,
      legal_name: `Seller ${i + 1} Pvt Ltd`,
      gstin: `${rng.int(10, 37)}${rng.int(100000000, 999999999)}Z${rng.int(1, 9)}`,
      pan_hash: rng.uuid().replace(/-/g, "").slice(0, 64),
      city,
      state: STATE_BY_CITY[city] ?? "Unknown",
      pincode: String(rng.int(100000, 999999)),
      tier,
      account_status: rng.weighted(
        ["active", "suspended", "under_review", "closed"],
        [88, 5, 4, 3]
      ),
      onboarded_at: rng.isoTs(new Date("2018-01-01"), END_DATE),
      _loaded_at: LOADED_AT,
    };
  });
}

function generateUsers(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const city = rng.pick(CITIES);
    return {
      user_id: `usr_${String(i + 1).padStart(10, "0")}`,
      created_at: rng.isoTs(new Date("2015-01-01"), END_DATE),
      phone_hash: rng.uuid().replace(/-/g, "").slice(0, 64),
      city,
      state: STATE_BY_CITY[city] ?? "Unknown",
      pincode: String(rng.int(100000, 999999)),
      is_plus_member: rng.next() > 0.85 ? "false" : (rng.next() > 0.7 ? "true" : "false"),
      acquisition_channel: rng.weighted(ACQUISITION_CHANNELS, CHANNEL_WEIGHTS),
      referrer_user_id: rng.next() > 0.85 ? `usr_${String(rng.int(1, i || 1)).padStart(10, "0")}` : "",
      _loaded_at: LOADED_AT,
    };
  });
}

function generateProducts(n: number, cats: ReturnType<typeof generateCategories>, sellerIds: string[]) {
  return Array.from({ length: n }, (_, i) => {
    const cat = rng.pick(cats);
    const mrp = Math.round(rng.logNormal(8.5, 1.2));  // ₹100–₹2L range in paise
    return {
      product_id: `prd_${String(i + 1).padStart(10, "0")}`,
      seller_id: rng.pick(sellerIds),
      category_id: cat.category_id,
      brand_id: `brd_${rng.int(1, 5000)}`,
      title: `${cat.l2} Product ${i + 1}`,
      description: `Quality ${cat.l2} product from trusted seller`,
      mrp,
      is_active: rng.next() > 0.12 ? "true" : "false",
      created_at: rng.isoTs(new Date("2018-01-01"), END_DATE),
      updated_at: rng.isoTs(new Date("2023-01-01"), END_DATE),
      _loaded_at: LOADED_AT,
    };
  });
}

function generateOrders(
  n: number,
  userIds: string[],
  productIds: string[],
  sellerIds: string[],
  catMap: Map<string, string>,
): { orders: Record<string, unknown>[]; orderItems: Record<string, unknown>[] } {
  const orders: Record<string, unknown>[] = [];
  const orderItems: Record<string, unknown>[] = [];

  const statuses = ["placed", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"];
  const statusWeights = [2, 3, 5, 5, 70, 10, 5];

  for (let i = 0; i < n; i++) {
    const orderId   = `ord_${String(i + 1).padStart(12, "0")}`;
    const userId    = rng.pick(userIds);
    const orderAt   = rng.isoTs(START_DATE, END_DATE);
    const status    = rng.weighted(statuses, statusWeights);
    const city      = rng.pick(CITIES);
    const method    = rng.weighted(PAYMENT_METHODS, PAYMENT_WEIGHTS);
    const channel   = rng.weighted(ACQUISITION_CHANNELS, CHANNEL_WEIGHTS);
    const itemCount = rng.weighted([1, 2, 3, 4, 5], [55, 25, 10, 6, 4]);

    let totalMrp = 0, totalSelling = 0;

    for (let j = 0; j < itemCount; j++) {
      const productId = rng.pick(productIds);
      const sellerId  = rng.pick(sellerIds);
      const qty       = rng.weighted([1, 2, 3], [80, 15, 5]);
      const mrp       = Math.round(rng.logNormal(8.5, 1.2));
      const disc      = rng.float(0, 0.55);
      const selling   = Math.round(mrp * (1 - disc));

      totalMrp     += mrp * qty;
      totalSelling += selling * qty;

      orderItems.push({
        order_item_id:         `oi_${String(i * 5 + j + 1).padStart(12, "0")}`,
        order_id:              orderId,
        product_id:            productId,
        variant_id:            `var_${rng.int(1, 10_000_000)}`,
        seller_id:             sellerId,
        quantity:              qty,
        mrp,
        selling_price:         selling,
        platform_commission_rate: rng.float(5, 25),
        coupon_discount_allocated: 0,
        item_status:           status,
        promised_delivery_at:  rng.isoTs(new Date(orderAt), new Date(Date.parse(orderAt) + 7 * 86400000)),
        _loaded_at:            LOADED_AT,
      });
    }

    orders.push({
      order_id:            orderId,
      user_id:             userId,
      session_id:          `ses_${rng.int(1, SCALE.sessions)}`,
      order_placed_at:     orderAt,
      order_status:        status,
      total_mrp:           totalMrp,
      total_selling_price: totalSelling,
      coupon_code:         rng.next() > 0.75 ? "" : `SAVE${rng.int(10, 50)}`,
      coupon_discount:     0,
      delivery_pincode:    String(rng.int(100000, 999999)),
      delivery_city:       city,
      delivery_state:      STATE_BY_CITY[city] ?? "Unknown",
      payment_method:      method,
      is_plus_order:       rng.next() > 0.85 ? "false" : "true",
      acquisition_channel: channel,
      _loaded_at:          LOADED_AT,
    });
  }

  return { orders, orderItems };
}

function generateReturns(orderItems: Record<string, unknown>[], sellerIds: string[]) {
  const deliveredItems = orderItems.filter(oi => oi.item_status === "delivered");
  const returnRate = 0.083;  // 8.3% platform return rate
  const returnsCount = Math.floor(deliveredItems.length * returnRate);

  return Array.from({ length: returnsCount }, (_, i) => {
    const item   = rng.pick(deliveredItems);
    const reason = rng.weighted(RETURN_REASONS, RETURN_WEIGHTS);
    const isSeller = ["wrong_item", "quality_issue"].includes(reason);

    return {
      return_id:            `ret_${String(i + 1).padStart(10, "0")}`,
      order_item_id:        item.order_item_id,
      order_id:             item.order_id,
      seller_id:            item.seller_id,
      return_reason:        reason,
      return_type:          rng.next() > 0.15 ? "refund" : "exchange",
      return_status:        rng.weighted(
        ["requested", "approved", "pickup_scheduled", "picked_up", "quality_checked", "refund_initiated", "completed", "rejected"],
        [5, 10, 10, 15, 15, 15, 25, 5]
      ),
      initiated_at:         rng.isoTs(new Date("2023-06-01"), END_DATE),
      pickup_at:            rng.next() > 0.2 ? rng.isoTs(new Date("2023-06-05"), END_DATE) : "",
      quality_check_result: rng.weighted(["approved", "partially_approved", "rejected"], [70, 20, 10]),
      seller_fault:         isSeller ? "true" : "false",
      _loaded_at:           LOADED_AT,
    };
  });
}

function generateSellerPerformanceDaily(sellerIds: string[]) {
  const rows: Record<string, unknown>[] = [];
  const days = 90;  // 90 days of history
  const baseDate = new Date("2024-04-16");

  // Only generate for a sample of sellers in dev mode
  const sampleSize = FULL_SCALE ? sellerIds.length : Math.min(1000, sellerIds.length);
  const sample = sellerIds.slice(0, sampleSize);

  for (const sellerId of sample) {
    const baseGmv = Math.round(rng.logNormal(10, 2));  // ₹100 to ₹5Cr/day range
    for (let d = 0; d < days; d++) {
      const date = new Date(baseDate.getTime() + d * 86400000);
      const dateStr = date.toISOString().slice(0, 10);
      const gmv = Math.max(0, Math.round(baseGmv * (0.7 + rng.next() * 0.6)));
      const orders = Math.max(0, Math.floor(gmv / rng.int(50000, 500000)));
      const returnRate = rng.float(0.01, 0.25);

      rows.push({
        perf_id:              `spd_${sellerId}_${dateStr.replace(/-/g, "")}`,
        seller_id:            sellerId,
        date:                 dateStr,
        gmv,
        orders_count:         orders,
        items_sold:           Math.floor(orders * rng.float(1.1, 2.5)),
        return_count:         Math.floor(orders * returnRate),
        return_rate:          returnRate,
        avg_delivery_days:    rng.float(1.5, 8.0),
        sla_breach_count:     Math.floor(orders * rng.float(0, 0.15)),
        cancellation_count:   Math.floor(orders * rng.float(0, 0.10)),
        cancellation_rate:    rng.float(0, 0.10),
        customer_rating_avg:  rng.float(2.5, 5.0),
        dispute_count:        rng.int(0, 5),
        _loaded_at:           LOADED_AT,
      });
    }
  }

  return rows;
}

function generateSearchQueries(n: number, userIds: string[], productIds: string[]) {
  const queries = [
    "iphone 15", "samsung galaxy", "laptop under 50000", "running shoes", "kurta men",
    "mixer grinder", "yoga mat", "face wash", "protein powder", "cricket bat",
    "headphones wireless", "smart tv 55 inch", "bed sheet king size", "perfume women",
    "refrigerator double door", "washing machine", "air purifier", "trimmer men",
    "dress women", "notebook",
  ];

  return Array.from({ length: n }, (_, i) => ({
    query_id:          `qry_${String(i + 1).padStart(12, "0")}`,
    user_id:           rng.pick(userIds),
    session_id:        `ses_${rng.int(1, SCALE.sessions)}`,
    query_text:        rng.pick(queries),
    result_count:      rng.int(0, 5000),
    clicked_product_id: rng.next() > 0.55 ? rng.pick(productIds) : "",
    click_rank:        rng.next() > 0.55 ? rng.int(1, 20) : "",
    queried_at:        rng.isoTs(START_DATE, END_DATE),
    _loaded_at:        LOADED_AT,
  }));
}

function generateExperiments(n: number) {
  const metrics = ["checkout_conversion_rate", "add_to_cart_rate", "order_gmv", "return_rate", "session_duration"];
  const expts = [];

  for (let i = 0; i < n; i++) {
    const startAt = rng.isoTs(new Date("2023-06-01"), new Date("2024-06-01"));
    expts.push({
      experiment_id:   `exp_${String(i + 1).padStart(6, "0")}`,
      name:            `experiment_${i + 1}_${rng.pick(["checkout", "pdp", "search", "home", "cart"])}`,
      hypothesis:      `Changing the ${rng.pick(["button", "layout", "copy", "image", "price display"])} will improve ${rng.pick(metrics)}`,
      primary_metric:  rng.pick(metrics),
      guardrail_metrics: JSON.stringify([rng.pick(metrics), rng.pick(metrics)]),
      started_at:      startAt,
      ended_at:        rng.next() > 0.3 ? rng.isoTs(new Date(startAt), END_DATE) : "",
      status:          rng.weighted(["draft", "running", "paused", "completed", "stopped"], [5, 25, 10, 55, 5]),
      winning_variant: rng.next() > 0.6 ? rng.pick(["control", "treatment_a", "treatment_b"]) : "",
      _loaded_at:      LOADED_AT,
    });
  }

  return expts;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🏗  QuickCart Data Warehouse Generator`);
  console.log(`   Mode: ${FULL_SCALE ? "FULL SCALE" : "development"}`);
  console.log(`   Output: ${OUTPUT_DIR}\n`);

  console.log("Generating categories...");
  const cats = generateCategories();
  writeCsv("categories.csv", cats.map(c => ({
    category_id: c.category_id,
    parent_category_id: "",
    name: c.name,
    level: c.level,
    path: c.path,
    is_active: "true",
    _loaded_at: LOADED_AT,
  })));

  console.log("Generating warehouses...");
  const warehouses = generateWarehouses(SCALE.warehouses);
  writeCsv("warehouses.csv", warehouses);
  const warehouseIds = warehouses.map(w => w.warehouse_id);

  console.log("Generating sellers...");
  const sellers = generateSellers(SCALE.sellers);
  writeCsv("sellers.csv", sellers);
  const sellerIds = sellers.map(s => s.seller_id);

  console.log("Generating users...");
  const users = generateUsers(SCALE.users);
  writeCsv("users.csv", users);
  const userIds = users.map(u => u.user_id);

  console.log("Generating products...");
  const catMap = new Map(cats.map(c => [c.category_id, c.l1]));
  const products = generateProducts(SCALE.products, cats, sellerIds);
  writeCsv("products.csv", products);
  const productIds = products.map(p => p.product_id);

  console.log("Generating orders + order_items...");
  const { orders, orderItems } = generateOrders(SCALE.orders, userIds, productIds, sellerIds, catMap);
  writeCsv("orders.csv", orders);
  writeCsv("order_items.csv", orderItems);

  console.log("Generating returns...");
  const returns = generateReturns(orderItems, sellerIds);
  writeCsv("returns.csv", returns);

  console.log("Generating seller_performance_daily...");
  const spd = generateSellerPerformanceDaily(sellerIds);
  writeCsv("seller_performance_daily.csv", spd);

  console.log("Generating search_queries...");
  const searches = generateSearchQueries(SCALE.search_queries, userIds, productIds);
  writeCsv("search_queries.csv", searches);

  console.log("Generating experiments...");
  const experiments = generateExperiments(SCALE.experiments);
  writeCsv("experiments.csv", experiments);

  // ── Summary ─────────────────────────────────────────────────────────────────

  const totalRows =
    cats.length + warehouses.length + sellers.length + users.length +
    products.length + orders.length + orderItems.length + returns.length +
    spd.length + searches.length + experiments.length;

  console.log(`\n${"─".repeat(60)}`);
  console.log(`✅  Generation complete`);
  console.log(`   Total rows:   ${totalRows.toLocaleString()}`);
  console.log(`   Orders:       ${orders.length.toLocaleString()}`);
  console.log(`   Order items:  ${orderItems.length.toLocaleString()}`);
  console.log(`   Returns:      ${returns.length.toLocaleString()} (${((returns.length / orderItems.filter(i => i.item_status === "delivered").length) * 100).toFixed(1)}% return rate)`);
  console.log(`   Seller×Day:   ${spd.length.toLocaleString()}`);
  if (FULL_SCALE) {
    console.log(`\n   Run  npm run simulate  to execute the onboarding simulation.`);
    console.log(`   Run  bq load --source_format=CSV  to load into BigQuery.`);
  } else {
    console.log(`\n   ℹ  Dev mode. Run with --scale=full for production volumes.`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
