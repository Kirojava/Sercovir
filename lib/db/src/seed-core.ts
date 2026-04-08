import { db } from "./index";
import {
  countriesTable,
  conflictsTable,
  committeesTable,
  resolutionsTable,
  alliancesTable,
  delegatesTable,
  intelligenceTable,
} from "./schema";

async function seedCore() {
  console.log("Seeding core data...");

  // ── COUNTRIES ─────────────────────────────────────────────────────────────
  await db.delete(countriesTable);
  const countries = await db.insert(countriesTable).values([
    { name: "United States", code: "US", region: "North America", flagEmoji: "🇺🇸", politicalSystem: "Federal Presidential Republic", gdp: "27360000000000", population: 335000000, militaryBudget: "886000000000", threatLevel: "elevated", stabilityIndex: "78.5", keyAlliances: ["NATO", "AUKUS", "Five Eyes"], notes: "Global superpower, largest economy and military. Major geopolitical actor." },
    { name: "China", code: "CN", region: "East Asia", flagEmoji: "🇨🇳", politicalSystem: "One-Party Socialist Republic", gdp: "17700000000000", population: 1411000000, militaryBudget: "224000000000", threatLevel: "high", stabilityIndex: "62.1", keyAlliances: ["SCO", "BRICS"], notes: "Rising global power, second-largest economy. Assertive in South China Sea and Taiwan Strait." },
    { name: "Russia", code: "RU", region: "Europe/Asia", flagEmoji: "🇷🇺", politicalSystem: "Federal Semi-Presidential Republic", gdp: "2240000000000", population: 145000000, militaryBudget: "109000000000", threatLevel: "critical", stabilityIndex: "39.2", keyAlliances: ["CSTO", "SCO", "BRICS"], notes: "Ongoing war in Ukraine. Under extensive Western sanctions. Permanent UN Security Council member." },
    { name: "United Kingdom", code: "GB", region: "Western Europe", flagEmoji: "🇬🇧", politicalSystem: "Constitutional Monarchy / Parliamentary Democracy", gdp: "3080000000000", population: 68000000, militaryBudget: "68000000000", threatLevel: "low", stabilityIndex: "82.4", keyAlliances: ["NATO", "Five Eyes", "AUKUS"], notes: "Post-Brexit pivot to global partnerships. Permanent UN Security Council member." },
    { name: "France", code: "FR", region: "Western Europe", flagEmoji: "🇫🇷", politicalSystem: "Semi-Presidential Republic", gdp: "2780000000000", population: 68000000, militaryBudget: "56000000000", threatLevel: "low", stabilityIndex: "80.1", keyAlliances: ["NATO", "EU"], notes: "Nuclear power, EU founding member. Permanent UN Security Council member." },
    { name: "Germany", code: "DE", region: "Western Europe", flagEmoji: "🇩🇪", politicalSystem: "Federal Parliamentary Republic", gdp: "4070000000000", population: 84000000, militaryBudget: "66000000000", threatLevel: "low", stabilityIndex: "84.6", keyAlliances: ["NATO", "EU"], notes: "Largest European economy. Major diplomatic actor in Ukraine conflict." },
    { name: "Israel", code: "IL", region: "Middle East", flagEmoji: "🇮🇱", politicalSystem: "Parliamentary Democracy", gdp: "522000000000", population: 9500000, militaryBudget: "23600000000", threatLevel: "critical", stabilityIndex: "48.3", keyAlliances: ["US bilateral", "Abraham Accords"], notes: "Active conflict in Gaza. Regional tensions with Iran, Hezbollah, and Houthi forces." },
    { name: "Iran", code: "IR", region: "Middle East", flagEmoji: "🇮🇷", politicalSystem: "Islamic Republic (Theocracy)", gdp: "704000000000", population: 87000000, militaryBudget: "10000000000", threatLevel: "critical", stabilityIndex: "31.7", keyAlliances: ["Axis of Resistance", "SCO observer"], notes: "Under US/UN sanctions. US-Iran ceasefire talks ongoing. Nuclear program under scrutiny." },
    { name: "Ukraine", code: "UA", region: "Eastern Europe", flagEmoji: "🇺🇦", politicalSystem: "Presidential Republic (Wartime)", gdp: "160000000000", population: 43000000, militaryBudget: "35000000000", threatLevel: "critical", stabilityIndex: "20.1", keyAlliances: ["EU candidate", "NATO partner"], notes: "Under Russian military invasion since Feb 2022. Receiving western military aid." },
    { name: "North Korea", code: "KP", region: "East Asia", flagEmoji: "🇰🇵", politicalSystem: "Juche Totalitarian State", gdp: "40000000000", population: 26000000, militaryBudget: "4000000000", threatLevel: "critical", stabilityIndex: "10.2", keyAlliances: ["Russia bilateral", "China bilateral"], notes: "Nuclear-armed rogue state. Ongoing ballistic missile tests. Supplying artillery to Russia." },
    { name: "Pakistan", code: "PK", region: "South Asia", flagEmoji: "🇵🇰", politicalSystem: "Federal Parliamentary Republic", gdp: "338000000000", population: 231000000, militaryBudget: "7600000000", threatLevel: "high", stabilityIndex: "33.8", keyAlliances: ["SCO", "OIC"], notes: "Nuclear-armed state. Ongoing instability, political turmoil, and economic crisis." },
    { name: "India", code: "IN", region: "South Asia", flagEmoji: "🇮🇳", politicalSystem: "Federal Parliamentary Republic", gdp: "3550000000000", population: 1428000000, militaryBudget: "74000000000", threatLevel: "elevated", stabilityIndex: "65.4", keyAlliances: ["Quad", "SCO", "BRICS"], notes: "World's most populous country, fifth largest economy. Balancing US and Russia ties." },
    { name: "Saudi Arabia", code: "SA", region: "Middle East", flagEmoji: "🇸🇦", politicalSystem: "Absolute Monarchy", gdp: "1060000000000", population: 36000000, militaryBudget: "75000000000", threatLevel: "elevated", stabilityIndex: "55.2", keyAlliances: ["Arab League", "GCC", "OPEC+"], notes: "Key US partner. Ongoing normalization talks with Israel. Host to Iran ceasefire negotiations." },
    { name: "Turkey", code: "TR", region: "Eurasia", flagEmoji: "🇹🇷", politicalSystem: "Presidential Republic", gdp: "1110000000000", population: 85000000, militaryBudget: "15800000000", threatLevel: "elevated", stabilityIndex: "47.6", keyAlliances: ["NATO", "OIC"], notes: "NATO member with independent foreign policy. Mediating role in Black Sea Grain Deal." },
    { name: "Brazil", code: "BR", region: "South America", flagEmoji: "🇧🇷", politicalSystem: "Federal Presidential Republic", gdp: "2130000000000", population: 215000000, militaryBudget: "18700000000", threatLevel: "elevated", stabilityIndex: "55.0", keyAlliances: ["BRICS", "Mercosur"], notes: "Regional power, BRICS founding member. Largest economy in Latin America." },
    { name: "South Korea", code: "KR", region: "East Asia", flagEmoji: "🇰🇷", politicalSystem: "Presidential Republic", gdp: "1710000000000", population: 52000000, militaryBudget: "46000000000", threatLevel: "elevated", stabilityIndex: "74.3", keyAlliances: ["US bilateral", "Quad Plus"], notes: "Faces direct threat from North Korea. Major US ally. Key semiconductor producer." },
    { name: "Japan", code: "JP", region: "East Asia", flagEmoji: "🇯🇵", politicalSystem: "Constitutional Monarchy / Parliamentary Democracy", gdp: "4230000000000", population: 124000000, militaryBudget: "51000000000", threatLevel: "low", stabilityIndex: "85.8", keyAlliances: ["US bilateral", "Quad"], notes: "Rearming under Article 9 revision. Key tech ally. Facing threats from China and North Korea." },
    { name: "Ethiopia", code: "ET", region: "Sub-Saharan Africa", flagEmoji: "🇪🇹", politicalSystem: "Federal Republic", gdp: "126000000000", population: 126000000, militaryBudget: "590000000000", threatLevel: "high", stabilityIndex: "27.4", keyAlliances: ["AU", "IGAD"], notes: "Recovering from Tigray War. Ongoing tensions with Egypt over Nile dam. Eritrea relations fragile." },
    { name: "Myanmar", code: "MM", region: "Southeast Asia", flagEmoji: "🇲🇲", politicalSystem: "Military Junta (SAC)", gdp: "65000000000", population: 54000000, militaryBudget: "2200000000", threatLevel: "critical", stabilityIndex: "14.3", keyAlliances: ["China bilateral"], notes: "Military coup Feb 2021. Civil war ongoing. Severe human rights abuses. Under international sanctions." },
    { name: "Venezuela", code: "VE", region: "South America", flagEmoji: "🇻🇪", politicalSystem: "Presidential Republic (Authoritarian)", gdp: "97000000000", population: 28000000, militaryBudget: "620000000000", threatLevel: "high", stabilityIndex: "23.1", keyAlliances: ["ALBA", "OPEC"], notes: "Disputed 2024 elections. Maduro regime under US sanctions. Ongoing territorial dispute with Guyana." },
  ]).returning();
  console.log(`Seeded ${countries.length} countries`);

  // ── ALLIANCES ─────────────────────────────────────────────────────────────
  await db.delete(alliancesTable);
  const alliances = await db.insert(alliancesTable).values([
    { name: "North Atlantic Treaty Organization", abbreviation: "NATO", type: "military", description: "Collective defence alliance of 32 member states from North America and Europe.", founded: "1949-04-04", memberCountries: ["United States", "United Kingdom", "France", "Germany", "Turkey", "Canada", "Italy", "Poland", "Norway", "Spain"], headquarters: "Brussels, Belgium", strength: "dominant" },
    { name: "European Union", abbreviation: "EU", type: "political", description: "Political and economic union of 27 member states located primarily in Europe.", founded: "1993-11-01", memberCountries: ["France", "Germany", "Italy", "Spain", "Poland", "Netherlands", "Belgium", "Sweden", "Romania", "Austria"], headquarters: "Brussels, Belgium", strength: "strong" },
    { name: "Shanghai Cooperation Organisation", abbreviation: "SCO", type: "political", description: "Eurasian political, economic, and security organisation led by China and Russia.", founded: "2001-06-15", memberCountries: ["China", "Russia", "India", "Pakistan", "Kazakhstan", "Iran"], headquarters: "Beijing, China", strength: "moderate" },
    { name: "BRICS", abbreviation: "BRICS", type: "economic", description: "Coalition of major emerging economies challenging Western financial dominance.", founded: "2009-06-16", memberCountries: ["Brazil", "Russia", "India", "China", "South Africa", "Egypt", "Ethiopia", "Iran", "UAE"], headquarters: "Johannesburg, South Africa (rotating)", strength: "growing" },
    { name: "Collective Security Treaty Organization", abbreviation: "CSTO", type: "military", description: "Russian-led military alliance of post-Soviet states.", founded: "1992-05-15", memberCountries: ["Russia", "Belarus", "Kazakhstan", "Kyrgyzstan", "Armenia", "Tajikistan"], headquarters: "Moscow, Russia", strength: "moderate" },
    { name: "AUKUS", abbreviation: "AUKUS", type: "military", description: "Trilateral security pact between Australia, UK, and US for Indo-Pacific security.", founded: "2021-09-15", memberCountries: ["Australia", "United Kingdom", "United States"], headquarters: "Canberra/London/Washington (trilateral)", strength: "strong" },
    { name: "Gulf Cooperation Council", abbreviation: "GCC", type: "economic", description: "Regional intergovernmental political and economic union of Arab Gulf states.", founded: "1981-05-25", memberCountries: ["Saudi Arabia", "UAE", "Kuwait", "Bahrain", "Qatar", "Oman"], headquarters: "Riyadh, Saudi Arabia", strength: "moderate" },
    { name: "Quadrilateral Security Dialogue", abbreviation: "QUAD", type: "security", description: "Strategic security dialogue between US, Australia, India, and Japan.", founded: "2007-05-04", memberCountries: ["United States", "Australia", "India", "Japan"], headquarters: "No fixed HQ (rotating)", strength: "growing" },
  ]).returning();
  console.log(`Seeded ${alliances.length} alliances`);

  // ── CONFLICTS ─────────────────────────────────────────────────────────────
  await db.delete(conflictsTable);
  const conflicts = await db.insert(conflictsTable).values([
    { title: "Russia-Ukraine War", description: "Russia's full-scale military invasion of Ukraine, the largest land war in Europe since WWII. Ukraine is defending its territory with Western military and financial support.", region: "Eastern Europe", status: "active", severity: "critical", startDate: "2022-02-24", partiesInvolved: ["Russia", "Ukraine", "NATO (support)"], casualties: 500000, displacedPersons: 14000000, notes: "Active front lines across Zaporizhzhia, Donetsk, Kherson, and Kharkiv oblasts. Peace negotiations stalled." },
    { title: "Gaza-Israel Conflict", description: "Israeli military campaign in Gaza following Hamas October 7, 2023 attack. Widespread civilian casualties and humanitarian crisis.", region: "Middle East", status: "active", severity: "critical", startDate: "2023-10-07", partiesInvolved: ["Israel", "Hamas", "Palestinian Authority"], casualties: 48000, displacedPersons: 2000000, notes: "Ongoing IDF operations. Hostage negotiations ongoing via Qatar/Egypt mediation. ICC arrest warrants issued." },
    { title: "Sudan Civil War", description: "Armed conflict between the Sudanese Armed Forces (SAF) and the Rapid Support Forces (RSF), resulting in a catastrophic humanitarian crisis.", region: "Sub-Saharan Africa", status: "active", severity: "critical", startDate: "2023-04-15", partiesInvolved: ["Sudan Armed Forces (SAF)", "Rapid Support Forces (RSF)"], casualties: 150000, displacedPersons: 10000000, notes: "World's largest displacement crisis. Famine conditions in multiple regions. No ceasefire agreement in sight." },
    { title: "Myanmar Civil War", description: "Ongoing armed conflict between Myanmar's military junta (SAC) and a broad coalition of ethnic armed organisations and People's Defence Forces (PDF).", region: "Southeast Asia", status: "escalating", severity: "critical", startDate: "2021-02-01", partiesInvolved: ["Myanmar SAC (Junta)", "People's Defence Force", "Ethnic Armed Organizations"], casualties: 50000, displacedPersons: 3000000, notes: "Resistance forces making significant territorial gains. China attempting mediation." },
    { title: "Sahel Insurgency", description: "Islamist insurgency by Jama'at Nusrat ul-Islam wa al-Muslimin (JNIM) and ISGS spanning Mali, Burkina Faso, and Niger, after military coups expelled French and UN forces.", region: "West Africa", status: "escalating", severity: "high", startDate: "2012-01-16", partiesInvolved: ["JNIM", "ISGS", "Mali SAF", "Burkina Faso SAF", "Niger SAF", "Russia (Wagner)"], casualties: 25000, displacedPersons: 4500000, notes: "AES military bloc expelled French and UN forces. Wagner/Africa Corps operating in region." },
    { title: "Houthi Red Sea Campaign", description: "Houthi forces firing ballistic missiles and drones at international shipping in the Red Sea, disrupting global trade routes.", region: "Middle East", status: "active", severity: "high", startDate: "2023-10-19", partiesInvolved: ["Yemen Houthis (Ansar Allah)", "US-UK coalition", "Israel"], casualties: 400, displacedPersons: 0, notes: "US-led Operation Prosperity Guardian conducting airstrikes on Yemen. Shipping rerouting around Africa." },
    { title: "Ethiopia-Eritrea Tensions", description: "Persistent military tensions between Ethiopia and Eritrea following the Tigray peace agreement, with Eritrea resisting TPLF reintegration.", region: "East Africa", status: "frozen", severity: "medium", startDate: "2020-11-03", partiesInvolved: ["Ethiopia", "Eritrea", "TPLF"], casualties: 600000, displacedPersons: 2500000, notes: "Pretoria Agreement (Nov 2022) brought ceasefire. Tensions remain high. Eritrea refuses to withdraw." },
    { title: "Taiwan Strait Tensions", description: "Ongoing military intimidation by China against Taiwan, including unprecedented military exercises and incursions into Taiwan's ADIZ.", region: "East Asia", status: "escalating", severity: "high", startDate: "2022-08-02", partiesInvolved: ["China (PLA)", "Taiwan", "United States (7th Fleet)"], casualties: 0, displacedPersons: 0, notes: "PLA conducting regular military exercises near Taiwan. US deploying carrier strike groups. Xi states reunification is 'inevitable'." },
    { title: "Korean Peninsula Crisis", description: "Escalating military provocations by North Korea including ballistic missile tests and nuclear threats, with Kim Jong-un declaring South Korea an 'enemy state'.", region: "East Asia", status: "escalating", severity: "high", startDate: "2022-09-25", partiesInvolved: ["North Korea", "South Korea", "United States", "Japan"], casualties: 0, displacedPersons: 0, notes: "North Korea conducting record number of missile tests. Troops reportedly deployed to Russia for Ukraine conflict." },
    { title: "South China Sea Disputes", description: "China asserting territorial claims over 90% of South China Sea, confronting Philippines, Vietnam, Malaysia vessels.", region: "Southeast Asia", status: "active", severity: "medium", startDate: "2009-05-07", partiesInvolved: ["China", "Philippines", "Vietnam", "Malaysia", "Brunei", "Taiwan"], casualties: 50, displacedPersons: 0, notes: "China reclaiming and militarizing artificial islands. Philippines invoking mutual defence treaty with US." },
    { title: "Venezuela-Guyana Border Dispute", description: "Venezuela claiming sovereignty over Essequibo region of Guyana, home to major oil reserves. Military buildup and territorial referendum.", region: "South America", status: "escalating", severity: "medium", startDate: "2023-12-01", partiesInvolved: ["Venezuela", "Guyana", "Brazil", "Caribbean Community (CARICOM)"], casualties: 0, displacedPersons: 0, notes: "ICJ issued provisional measures. Venezuela massing troops near border. US pledging support to Guyana." },
    { title: "Nagorno-Karabakh Aftermath", description: "Post-conflict situation following Azerbaijan's September 2023 military offensive. 100,000 ethnic Armenians forcibly displaced.", region: "Caucasus", status: "frozen", severity: "medium", startDate: "2023-09-19", partiesInvolved: ["Azerbaijan", "Armenia", "Russia (CSTO)"], casualties: 200, displacedPersons: 100000, notes: "Karabakh region now fully under Azerbaijan control. Peace treaty negotiations ongoing in Brussels." },
  ]).returning();
  console.log(`Seeded ${conflicts.length} conflicts`);

  // ── COMMITTEES ─────────────────────────────────────────────────────────────
  await db.delete(committeesTable);
  const committees = await db.insert(committeesTable).values([
    { name: "United Nations Security Council", abbreviation: "UNSC", topic: "Maintaining International Peace and Security in the Context of the Russia-Ukraine War", description: "The primary UN body responsible for international peace and security. Holds extraordinary sessions on the Ukraine crisis.", session: "Emergency Session 2026-A", chairperson: "Ambassador Jomo Mwachofi (Kenya)", status: "active", delegateCount: 15 },
    { name: "General Assembly First Committee", abbreviation: "GA1", topic: "Nuclear Non-Proliferation and Disarmament in the Indo-Pacific Region", description: "Deals with disarmament and international security matters. Focused on North Korean nuclear threat.", session: "81st Session", chairperson: "Ambassador Sofia Larsson (Sweden)", status: "active", delegateCount: 193 },
    { name: "Human Rights Council", abbreviation: "HRC", topic: "Accountability for Civilian Casualties in Active Conflict Zones", description: "UN body responsible for strengthening the promotion and protection of human rights globally.", session: "56th Session", chairperson: "Ambassador Ama Owusu (Ghana)", status: "active", delegateCount: 47 },
    { name: "International Monetary Fund Board", abbreviation: "IMF-EB", topic: "Debt Relief and Economic Recovery Mechanisms for Conflict-Affected Nations", description: "Governing body overseeing IMF policy on economic stabilisation and debt restructuring.", session: "Spring 2026 Meeting", chairperson: "Dr. Kristin Ingolfsson (Iceland)", status: "active", delegateCount: 24 },
    { name: "UN Environment Programme", abbreviation: "UNEP", topic: "Climate Finance and Fossil Fuel Phase-Out in the Global South", description: "The principal UN body for environmental and sustainability issues.", session: "UNEA-7", chairperson: "Ambassador Liu Wei (Singapore)", status: "upcoming", delegateCount: 193 },
    { name: "International Labour Organization", abbreviation: "ILO", topic: "Impact of Artificial Intelligence on Global Labour Markets and Workers' Rights", description: "Tripartite UN agency setting international labour standards and overseeing labour rights.", session: "114th International Labour Conference", chairperson: "Madam Chair Emilia Johansson (Norway)", status: "upcoming", delegateCount: 187 },
    { name: "African Union Peace and Security Council", abbreviation: "AU-PSC", topic: "Addressing the Humanitarian Crisis and Transition to Democracy in Sudan", description: "AU's standing body for prevention, management, and resolution of conflicts in Africa.", session: "1148th Meeting", chairperson: "Commissioner Dr. Bankole Adeoye", status: "active", delegateCount: 15 },
    { name: "World Health Organization Executive Board", abbreviation: "WHO-EB", topic: "Pandemic Preparedness and Health System Resilience in Post-Conflict States", description: "WHO's executive body overseeing programme of work and implementation of resolutions.", session: "156th Meeting", chairperson: "Dr. Priya Nair (India)", status: "upcoming", delegateCount: 34 },
  ]).returning();
  console.log(`Seeded ${committees.length} committees`);

  // ── RESOLUTIONS ────────────────────────────────────────────────────────────
  await db.delete(resolutionsTable);
  const resolutions = await db.insert(resolutionsTable).values([
    {
      title: "UNSC/RES/2026-01: Demanding Immediate Ceasefire in Ukraine",
      committeeId: committees[0].id,
      sponsors: ["France", "United Kingdom", "United States", "Germany"],
      signatories: ["Japan", "South Korea", "Australia", "Canada", "Norway", "Netherlands"],
      preambularClauses: ["Recalling all previous resolutions on the territorial integrity of Ukraine", "Deeply alarmed by the continued loss of civilian life and destruction of civilian infrastructure", "Emphasizing that peace negotiations must respect Ukraine's internationally recognised borders", "Noting with concern the humanitarian catastrophe affecting over 14 million displaced persons"],
      operativeClauses: ["Demands an immediate, unconditional ceasefire by all parties along current front lines", "Calls upon Russia to immediately withdraw all military forces from Ukrainian territory", "Urges immediate establishment of humanitarian corridors for civilian evacuation", "Requests the Secretary-General to appoint a Special Envoy for Ukraine peace negotiations within 30 days", "Authorises an expanded UN monitoring mission of 500 observers to all contested regions"],
      status: "failed",
      votesFor: 12,
      votesAgainst: 2,
      abstentions: 1,
    },
    {
      title: "UNSC/RES/2026-02: Sanctions Expansion on Russia",
      committeeId: committees[0].id,
      sponsors: ["United States", "United Kingdom", "France"],
      signatories: ["Germany", "Japan", "Australia", "Canada"],
      preambularClauses: ["Recalling Resolution 2623 (2022) which noted Russia's illegal aggression", "Recognising the International Court of Justice provisional orders on the Ukraine conflict", "Stressing the importance of accountability for violations of international humanitarian law"],
      operativeClauses: ["Decides to impose an immediate arms embargo on the Russian Federation", "Freezes assets of senior Russian military and government officials listed in Annex I", "Bans Russian flag vessels from accessing ports of member states", "Establishes a sanctions monitoring committee to review compliance"],
      status: "draft",
      votesFor: 0,
      votesAgainst: 0,
      abstentions: 0,
    },
    {
      title: "GA1/RES/2026-01: Treaty on Complete Nuclear Disarmament in Northeast Asia",
      committeeId: committees[1].id,
      sponsors: ["Japan", "South Korea", "Australia", "New Zealand"],
      signatories: ["Canada", "Norway", "Germany", "Netherlands", "Sweden", "Switzerland"],
      preambularClauses: ["Deeply concerned by North Korea's continued ballistic missile and nuclear weapons tests", "Affirming the principles of the Nuclear Non-Proliferation Treaty (NPT)", "Recognising that denuclearisation of the Korean Peninsula is essential to regional stability"],
      operativeClauses: ["Calls on the DPRK to immediately halt all ballistic missile and nuclear weapons programmes", "Urges the resumption of Six-Party Talks under new IAEA-monitored framework", "Establishes a 15-member expert panel to design denuclearisation verification mechanisms", "Recommends phased sanctions relief conditioned on verified DPRK denuclearisation steps"],
      status: "passed",
      votesFor: 187,
      votesAgainst: 3,
      abstentions: 8,
    },
    {
      title: "HRC/RES/2026-01: Independent Investigation into Civilian Casualties in Gaza",
      committeeId: committees[2].id,
      sponsors: ["Jordan", "Egypt", "South Africa", "Bolivia", "Pakistan"],
      signatories: ["Brazil", "Indonesia", "Malaysia", "Algeria", "Bangladesh", "Morocco", "Senegal"],
      preambularClauses: ["Gravely concerned by the high number of civilian casualties in the Gaza Strip", "Recalling the ICJ's provisional measures ordering Israel to prevent genocide", "Affirming the applicability of international humanitarian law to all parties"],
      operativeClauses: ["Establishes an Independent International Commission of Inquiry on Gaza", "Mandates the commission to investigate all violations of international humanitarian law", "Calls on Israel and Hamas to grant full and unimpeded access to investigators", "Requests a full report to the Human Rights Council within 120 days"],
      status: "passed",
      votesFor: 31,
      votesAgainst: 6,
      abstentions: 10,
    },
    {
      title: "IMF-EB/RES/2026-01: Debt Relief Framework for War-Affected Economies",
      committeeId: committees[3].id,
      sponsors: ["France", "Germany", "Japan", "Canada"],
      signatories: ["United Kingdom", "Australia", "Netherlands", "Sweden", "Norway"],
      preambularClauses: ["Recognising the devastating economic impact of prolonged conflict on developing nations", "Noting that debt service obligations are preventing war-affected economies from rebuilding", "Emphasizing the need for coordinated multilateral debt relief mechanisms"],
      operativeClauses: ["Establishes a Conflict Recovery Debt Suspension Initiative (CRDSI) for eligible members", "Suspends debt service payments for war-affected IMF members for 24 months", "Provides $50 billion in Special Drawing Rights (SDRs) for reconstruction financing", "Creates an IMF monitoring team to assess economic recovery progress"],
      status: "under_review",
      votesFor: 18,
      votesAgainst: 3,
      abstentions: 3,
    },
    {
      title: "AU-PSC/RES/2026-01: Emergency Humanitarian Response to Sudan Crisis",
      committeeId: committees[6].id,
      sponsors: ["Egypt", "Kenya", "Nigeria", "Ethiopia"],
      signatories: ["Uganda", "South Africa", "Algeria", "Morocco", "Ghana", "Rwanda"],
      preambularClauses: ["Alarmed by the catastrophic humanitarian situation in Sudan, with over 10 million displaced", "Recalling AU Constitutive Act provisions on non-indifference to serious crimes", "Deeply concerned by credible reports of ethnic cleansing and sexual violence"],
      operativeClauses: ["Authorises deployment of 5,000 AU protection force to Port Sudan and El Fasher", "Demands immediate ceasefire between SAF and RSF forces", "Establishes humanitarian corridors for aid delivery to Darfur region", "Calls for targeted sanctions against commanders responsible for atrocities", "Requests engagement with Chad, Egypt, and UAE to cut off RSF arms supply"],
      status: "passed",
      votesFor: 13,
      votesAgainst: 1,
      abstentions: 1,
    },
    {
      title: "HRC/RES/2026-02: Special Rapporteur on AI-Enabled Surveillance and Human Rights",
      committeeId: committees[2].id,
      sponsors: ["Germany", "France", "Sweden", "Norway", "Canada"],
      signatories: ["Japan", "Australia", "United Kingdom", "Netherlands", "Ireland"],
      preambularClauses: ["Recognising that artificial intelligence surveillance technologies are enabling unprecedented violations of privacy and freedom of expression", "Concerned by widespread use of AI-enabled surveillance by authoritarian governments", "Affirming that human rights apply equally online and offline"],
      operativeClauses: ["Appoints a UN Special Rapporteur on Artificial Intelligence and Human Rights", "Requests a comprehensive report on AI surveillance practices within 18 months", "Calls on states to adopt AI governance frameworks consistent with human rights law", "Urges private companies to conduct human rights due diligence on AI exports"],
      status: "draft",
      votesFor: 0,
      votesAgainst: 0,
      abstentions: 0,
    },
    {
      title: "GA1/RES/2026-02: Prohibition of Autonomous Lethal Weapons Systems",
      committeeId: committees[1].id,
      sponsors: ["Austria", "Switzerland", "Ireland", "New Zealand", "Costa Rica"],
      signatories: ["Mexico", "Chile", "Jordan", "Algeria", "Philippines", "Bangladesh", "Thailand"],
      preambularClauses: ["Alarmed by rapid development and potential deployment of fully autonomous weapons", "Reaffirming that meaningful human control over life-and-death decisions is a fundamental principle", "Noting that 60+ nations have called for new international rules on autonomous weapons"],
      operativeClauses: ["Calls for immediate international negotiations on a legally binding treaty prohibiting LAWS", "Establishes a Group of Governmental Experts under the Convention on Certain Conventional Weapons", "Urges states to adopt national moratoria on development of fully autonomous weapons", "Mandates annual reporting to the Secretary-General on states' autonomous weapons programmes"],
      status: "under_review",
      votesFor: 143,
      votesAgainst: 12,
      abstentions: 38,
    },
  ]).returning();
  console.log(`Seeded ${resolutions.length} resolutions`);

  // ── DELEGATES ──────────────────────────────────────────────────────────────
  await db.delete(delegatesTable);
  const delegates = await db.insert(delegatesTable).values([
    // UNSC
    { name: "Ambassador Daniel Walsh", country: "United States", countryCode: "US", committeeId: committees[0].id, position: "permanent_member", bloc: "P5", notes: "Career diplomat. Former NSC director for multilateral affairs." },
    { name: "Ambassador Sophie Beaumont", country: "France", countryCode: "FR", committeeId: committees[0].id, position: "permanent_member", bloc: "P5", notes: "Specialist in conflict mediation and European security affairs." },
    { name: "Ambassador James Whitfield", country: "United Kingdom", countryCode: "GB", committeeId: committees[0].id, position: "permanent_member", bloc: "P5", notes: "Former UK Deputy NSA. Hawkish stance on Russia sanctions." },
    { name: "Ambassador Chen Guang", country: "China", countryCode: "CN", committeeId: committees[0].id, position: "permanent_member", bloc: "P5", notes: "Seasoned diplomat. Will veto resolutions targeting Russian interests." },
    { name: "Ambassador Dmitri Volkov", country: "Russia", countryCode: "RU", committeeId: committees[0].id, position: "permanent_member", bloc: "P5", notes: "Hard-liner. Will exercise veto on Ukraine resolutions." },
    { name: "Ambassador Jomo Mwachofi", country: "Kenya", countryCode: "KE", committeeId: committees[0].id, position: "chairperson", bloc: "African Group", notes: "Committee chair. Advocating for African perspectives on global security." },
    { name: "Ambassador Leila Samadi", country: "Iran", countryCode: "IR", committeeId: committees[0].id, position: "observer", bloc: "Asia Group", notes: "Observer status pending UNSC membership rotation." },
    // GA1
    { name: "Ambassador Yuki Tanaka", country: "Japan", countryCode: "JP", committeeId: committees[1].id, position: "co-sponsor", bloc: "Asia-Pacific", notes: "Lead sponsor of nuclear disarmament resolution. Strong anti-DPRK stance." },
    { name: "Ambassador Min-Jung Park", country: "South Korea", countryCode: "KR", committeeId: committees[1].id, position: "co-sponsor", bloc: "Asia-Pacific", notes: "Frontline state. Pushing for verifiable denuclearisation framework." },
    { name: "Ambassador Kim Chol-soo", country: "North Korea", countryCode: "KP", committeeId: committees[1].id, position: "delegate", bloc: "Non-Aligned Movement", notes: "Hardline position. Will not accept external verification regime." },
    { name: "Ambassador Priya Sharma", country: "India", countryCode: "IN", committeeId: committees[1].id, position: "delegate", bloc: "Non-Aligned Movement", notes: "Nuclear power outside NPT. Balancing act between blocs." },
    // HRC
    { name: "Ambassador Amira Khalil", country: "Egypt", countryCode: "EG", committeeId: committees[2].id, position: "sponsor", bloc: "Arab Group", notes: "Strong advocate for Palestinian rights. Co-sponsoring Gaza investigation resolution." },
    { name: "Ambassador Johann Fischer", country: "Germany", countryCode: "DE", committeeId: committees[2].id, position: "sponsor", bloc: "Western European Group", notes: "Champion of AI human rights resolution. Strong stance on rule of law." },
    { name: "Ambassador Naledi Dlamini", country: "South Africa", countryCode: "ZA", committeeId: committees[2].id, position: "co-sponsor", bloc: "African Group", notes: "ICJ genocide case co-applicant. Strong position on Gaza." },
    // IMF
    { name: "Deputy Governor Maria Okonkwo", country: "Nigeria", countryCode: "NG", committeeId: committees[3].id, position: "delegate", bloc: "Sub-Saharan Africa constituency", notes: "Advocating for expanded SDR allocation for African economies." },
    { name: "Deputy Governor Erik Lindstrom", country: "Sweden", countryCode: "SE", committeeId: committees[3].id, position: "delegate", bloc: "Nordic-Baltic constituency", notes: "Supporting debt relief framework with strong conditionality." },
    { name: "Deputy Governor Reza Tehrani", country: "Iran", countryCode: "IR", committeeId: committees[3].id, position: "delegate", bloc: "Middle East constituency", notes: "Seeking sanctions relief as part of debt restructuring discussion." },
    // AU-PSC
    { name: "Ambassador Kofi Mensah", country: "Ghana", countryCode: "GH", committeeId: committees[6].id, position: "delegate", bloc: "ECOWAS bloc", notes: "Pushing for rapid deployment of AU protection force to Sudan." },
    { name: "Ambassador Fatou Diallo", country: "Senegal", countryCode: "SN", committeeId: committees[6].id, position: "delegate", bloc: "ECOWAS bloc", notes: "Mediator on Sahel issues. Supporting humanitarian resolution." },
    { name: "Ambassador Ahmed Al-Rashid", country: "Egypt", countryCode: "EG", committeeId: committees[6].id, position: "delegate", bloc: "North Africa", notes: "Egypt supports SAF. Concerned about Nile security implications." },
  ]).returning();
  console.log(`Seeded ${delegates.length} delegates`);

  // ── INTELLIGENCE BRIEFINGS ────────────────────────────────────────────────
  await db.delete(intelligenceTable);
  await db.insert(intelligenceTable).values([
    { title: "FLASH: US-Iran Ceasefire Negotiations — Conditional Pause Agreed", content: "Intelligence sources confirm a conditional 72-hour pause in hostilities has been agreed between US-backed forces and Iranian proxies. The agreement, brokered by Qatar and Oman, includes a partial reopening of the Strait of Hormuz to commercial shipping. Crude oil prices fell 15%+ on the news. The ceasefire is conditional on Iran halting uranium enrichment above 60%. Verification mechanisms are being established. Sercovir assesses this as FRAGILE — a single violation could collapse negotiations.", category: "alert", priority: "critical", relatedCountries: ["Iran", "United States", "Israel", "Saudi Arabia"], source: "DIPLOMATIC_INTERCEPT" },
    { title: "ASSESSMENT: North Korean ICBM Programme Accelerating", content: "Satellite imagery analysis confirms North Korea has resumed full-scale ICBM testing operations at Sohae Launch Facility. Three new mobile missile launchers have been observed on regular patrol routes. DPRK state media announced Kim Jong-un personally oversaw a new 'super-large nuclear warhead' test. US Strategic Command has raised alert posture. Japan activates Patriot PAC-3 batteries. South Korea extending Range of Ballistic Missile Defence in coordination with US.", category: "assessment", priority: "critical", relatedCountries: ["North Korea", "South Korea", "Japan", "United States"], source: "GEOINT_ANALYSIS" },
    { title: "REPORT: Sudan — RSF Forces Advancing on El Fasher, Final Enclave", content: "Rapid Support Forces (RSF) have encircled El Fasher, the last state capital in Darfur under SAF control. Population of approximately 800,000 civilians trapped. UN reports acute famine conditions. Médecins Sans Frontières field hospital destroyed. ICC prosecutor has opened formal investigation into RSF command structure for potential crimes against humanity. AU-PSC emergency session convened.", category: "report", priority: "critical", relatedCountries: ["Sudan", "Chad", "Egypt", "United Arab Emirates"], source: "HUMINT_AFRICA" },
    { title: "ALERT: China Conducting Unprecedented PLA Naval Exercises Near Taiwan", content: "PLA Navy has deployed two carrier battle groups for Joint Sword-2026 exercises surrounding Taiwan. 47 PLA aircraft crossed median line in 24-hour period — record high. Taiwan has activated its reserve forces for the first time since 1996 Taiwan Strait Crisis. USS Ronald Reagan (CVN-76) and USS Carl Vinson (CVN-70) have taken up positions in Philippine Sea. US invoked Taiwan Relations Act consultations. Economic impact: TSMC shares fell 8%.", category: "alert", priority: "critical", relatedCountries: ["China", "Taiwan", "United States", "Japan"], source: "SIGINT_INDOPACOM" },
    { title: "ASSESSMENT: Wagner Group Reconstituted as 'Africa Corps' under Direct GRU Control", content: "Analysis confirms the Wagner Group has been fully restructured as 'Africa Corps' (Korpus Afrika), operating under direct Russian GRU military intelligence command. Strength estimated at 9,000–12,000 personnel across Mali, Burkina Faso, Niger, Libya, Sudan, and CAR. Africa Corps is training local militias and providing air defence. Russia is using Africa Corps to extract mineral resources — gold, uranium, diamonds — to circumvent Western sanctions.", category: "assessment", priority: "high", relatedCountries: ["Russia", "Mali", "Burkina Faso", "Niger", "Sudan", "Libya"], source: "OSINT_AFRICA" },
    { title: "REPORT: Iranian Ballistic Missile Exports to Russia Confirmed", content: "Multiple intelligence services have confirmed delivery of Fateh-110 and Zolfaghar ballistic missiles from Iran to Russia for use in Ukraine. At least 400 missiles transferred via Caspian Sea route. US Treasury has imposed new sanctions on 9 Iranian entities involved in production and transport. UK, France, and Germany triggering snapback mechanism under JCPOA. Delivery included technical advisors from IRGC Aerospace Force.", category: "report", priority: "high", relatedCountries: ["Iran", "Russia", "Ukraine", "United States"], source: "DIPLOMATIC_INTERCEPT" },
    { title: "WARNING: Myanmar Junta Losing Territorial Control at Accelerating Rate", content: "Resistance forces have captured Lashio, the largest city in northern Shan State and key military hub. Three Tactical Command headquarters have fallen in 30 days. Junta air force conducting indiscriminate airstrikes on civilian areas. China engaging both SAC and resistance leadership for ceasefire talks. Thailand and India concerned about refugee flows. SAC may be approaching critical vulnerability threshold.", category: "warning", priority: "high", relatedCountries: ["Myanmar", "China", "Thailand", "India"], source: "HUMINT_SOUTHEAST_ASIA" },
    { title: "ASSESSMENT: Houthi Red Sea Campaign — Economic Impact Escalating", content: "Houthi attacks have now displaced over 20% of global container shipping from the Red Sea-Suez route. Average shipping time from Asia to Europe increased by 12–14 days. Shipping insurance premiums increased 600%. Egyptian Suez Canal revenues down 40% ($6B annually at risk). US-UK coalition airstrikes have degraded but not eliminated Houthi missile capability. IRGC continuing to supply anti-ship missiles via Oman. Assessment: Campaign will continue for minimum 6 months.", category: "assessment", priority: "high", relatedCountries: ["Yemen", "Iran", "United States", "United Kingdom", "Egypt", "Israel"], source: "MARITIME_INTEL" },
    { title: "UPDATE: ICC Issues Arrest Warrants for Russian Military Commanders", content: "International Criminal Court issued arrest warrants for four Russian Armed Forces senior commanders for war crimes in Ukraine: strikes on civilian infrastructure (power plants, hospitals, schools), deportation of Ukrainian children, and use of prohibited weapons (cluster munitions, thermobaric weapons). Russia and Belarus not ICC members — cannot be arrested without cooperation. Warrants limit travel of named commanders to 124 ICC member states.", category: "update", priority: "medium", relatedCountries: ["Russia", "Ukraine"], source: "ICC_MONITOR" },
    { title: "REPORT: Venezuela Massing Troops at Essequibo Border with Guyana", content: "Satellite imagery confirms Venezuela has moved an armoured brigade (approx. 4,000 troops, 80 armoured vehicles) to the Essequibo border region with Guyana. CARICOM has convened emergency session. US Southern Command repositioning patrol vessels. ICJ has expanded provisional measures. Maduro government holding nationalist rallies claiming 'Los Cayos son nuestros'. Exxon-Mobil (operating offshore Guyana fields) has activated contingency plans.", category: "alert", priority: "medium", relatedCountries: ["Venezuela", "Guyana", "Brazil", "United States"], source: "GEOINT_SOUTHCOM" },
    { title: "UPDATE: IAEA — Iran 60% Enriched Uranium Stockpile Reaches Weapons-Grade Threshold", content: "IAEA quarterly report confirms Iran's stockpile of 60% enriched uranium has reached 714kg — sufficient for approximately 5–7 nuclear warheads if further enriched to 90%+. Iran maintaining 12 IR-6 advanced centrifuge cascades at Natanz and Fordow. IAEA inspectors denied access to Parchin military complex for 18 months. Breakout time estimated at 1–2 weeks. P5+1 consulting on diplomatic response options.", category: "report", priority: "critical", relatedCountries: ["Iran", "United States", "Israel", "Germany", "France", "United Kingdom"], source: "IAEA_MONITOR" },
    { title: "WARNING: Pakistan — Nuclear Arsenal Security Concerns Amid Political Instability", content: "Political instability following the arrest of former PM Imran Khan and subsequent inter-service intelligence disputes has raised concerns from US intelligence about the security of Pakistan's approximately 165 nuclear warheads. Army Chief Gen. Asim Munir is believed to have consolidated control of nuclear command authority outside civilian oversight. Pakistan has declined US requests for enhanced Permissive Action Link (PAL) verification.", category: "warning", priority: "high", relatedCountries: ["Pakistan", "United States", "India", "China"], source: "NSIC_ASSESSMENT" },
  ]);
  console.log("Seeded intelligence briefings");

  console.log("✅ Core seed complete!");
}

seedCore().catch(console.error);
