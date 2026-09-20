/**
 * One-time seed: Cristina group quote (Sep 2026).
 * Run: npx tsx scripts/seed-contact-cristina.ts
 * Requires DATABASE_URL.
 */
import { eq } from "drizzle-orm";
import { getDb } from "../src/lib/db";
import { contactInquiries, contactMessages } from "../src/lib/schema";

const INQUIRY_ID = "a1b2c3d4-e5f6-4789-a012-000000000001";

const MESSAGE = `Hi! I'm interested in ordering a custom portrait in the Demon Slayer style for my partner and me.

The only thing I'm not sure about is that we have 7 pets that i would also love to include, so there would be 9 subjects in total (the two of us + our 7 pets).

Would it be possible to include the pets in a less prominent way, rather than having all of them as full-body characters? For example, they could appear as smaller "visions" or little portraits/heads around us, almost like memories or little appearances, while my partner and I remain the main characters.

Do you think this composition would be possible? And would the pets still count as additional characters if they are included this way?

Thank you!`;

async function main() {
  const db = getDb();
  const [existing] = await db
    .select({ id: contactInquiries.id })
    .from(contactInquiries)
    .where(eq(contactInquiries.id, INQUIRY_ID))
    .limit(1);

  if (existing) {
    console.log("Cristina inquiry already seeded (id:", INQUIRY_ID, ")");
    return;
  }

  const createdAt = new Date("2026-09-20T00:06:00.000Z");

  await db.insert(contactInquiries).values({
    id: INQUIRY_ID,
    createdAt,
    name: "Cristina",
    email: "cristina_117@hotmail.com",
    subject: "Group quote",
    status: "open",
    linkedOrderId: null,
  });

  await db.insert(contactMessages).values({
    inquiryId: INQUIRY_ID,
    direction: "inbound",
    body: MESSAGE,
    createdAt,
  });

  console.log("Seeded Cristina group quote inquiry:", INQUIRY_ID);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
