const axios = require("axios");

const supabaseUrl = "https://haiwteyfxsxoekzkoeqx.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhaXd0ZXlmeHN4b2VremtvZXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU5MTU3NiwiZXhwIjoyMDY1MTY3NTc2fQ.wCSSgQSxXQuuwew4gvwqXqSAWFo0_M30QvtNMAmZImw";

// List of test users (first and last names)
const testUsers = [
  { first: "Mary", last: "Wanjiku" },
  { first: "Grace", last: "Akinyi" },
  { first: "Jane", last: "Njeri" },
  { first: "Esther", last: "Atieno" },
  { first: "Susan", last: "Chebet" },
  { first: "Lucy", last: "Wambui" },
  { first: "Agnes", last: "Nyambura" },
  { first: "Beatrice", last: "Moraa" },
  { first: "Catherine", last: "Muthoni" },
  { first: "Margaret", last: "Wafula" },
  { first: "Ann", last: "Mwikali" },
];

async function createUsers() {
  for (let user of testUsers) {
    const email = `${user.first.toLowerCase()}.${user.last.toLowerCase()}@gmail.com`;
    try {
      const { data } = await axios.post(
        `${supabaseUrl}/auth/v1/admin/users`,
        {
          email,
          password: "TempPass123!",
          user_metadata: { full_name: `${user.first} ${user.last}` },
        },
        {
          headers: {
            apiKey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`✅ Created ${email}`);
    } catch (err) {
      console.error(`❌ Failed ${email}:`, err.response?.data || err.message);
    }
  }
}

createUsers();
