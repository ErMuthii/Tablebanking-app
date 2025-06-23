const axios = require('axios');

const supabaseUrl = 'https://haiwteyfxsxoekzkoeqx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhaXd0ZXlmeHN4b2VremtvZXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU5MTU3NiwiZXhwIjoyMDY1MTY3NTc2fQ.wCSSgQSxXQuuwew4gvwqXqSAWFo0_M30QvtNMAmZImw';

const users = [
  { id: 'dde779e1-fd8d-4cbc-9ff4-041735e01525', email: 'liam.smith@gmail.com' },
  { id: '289a881b-ce78-4d5a-ac92-8a91ebc67b1b', email: 'noah.johnson@gmail.com' },
  { id: '070f73d7-eae7-42ab-9b5e-6002c509344e', email: 'oliver.williams@gmail.com' },
  { id: '8e05c2d2-f66d-4980-8580-fe5c069ad4f9', email: 'emma.brown@gmail.com' },
  { id: '513341c2-6b08-40a2-b0ec-7949ed2a8cfb', email: 'ava.jones@gmail.com' },
  { id: '88d66ce5-1e74-4e0e-8df1-d633225ef64c', email: 'sophia.garcia@gmail.com' },
  { id: '20a7a98f-e05c-4809-9ca8-2d7d8838e65a', email: 'isabella.miller@gmail.com' },
  { id: '60c396bb-06ce-41fa-8b58-f99cfd9a2b16', email: 'mia.davis@gmail.com' },
  { id: '15f33018-c1cf-4891-b573-845a6d866c87', email: 'charlotte.martinez@gmail.com' },
  { id: 'b7df895d-4de9-4597-8917-6932df2b96a0', email: 'amelia.rodriguez@gmail.com' },
  { id: 'eb77fdcb-51f7-440a-9de7-a822e20a6c94', email: 'harper.wilson@gmail.com' },
  { id: '9dc2196a-36ea-43fb-a34f-ba66e2f0785a', email: 'evelyn.moore@gmail.com' },
  { id: '23b6c7b1-4e3f-41ad-82a6-5a0ae749af0b', email: 'abigail.taylor@gmail.com' }
];

async function createUsers() {
  for (let user of users) {
    try {
      const { data } = await axios.post(
        `${supabaseUrl}/auth/v1/admin/users`,
        {
          email: user.email,
          password: 'TempPass123!',
          user_metadata: {},
          id: user.id
        },
        {
          headers: {
            apiKey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Created ${user.email}`);
    } catch (err) {
      console.error(`❌ Failed ${user.email}:`, err.response?.data || err.message);
    }
  }
}

createUsers();
