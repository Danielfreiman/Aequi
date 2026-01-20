import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MASTER_EMAIL = process.env.SUPABASE_MASTER_EMAIL || 'danifreiman44@gmail.com';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const authHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'content-type': 'application/json',
};

const getUserIdByEmail = async (email) => {
  const response = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    { headers: authHeaders }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch user by email: ${response.status} ${body}`);
  }

  const payload = await response.json();
  const user = payload?.users?.[0] || payload?.[0] || null;
  return user?.id || null;
};

const createUserIfMissing = async (email) => {
  const existingId = await getUserIdByEmail(email);
  if (existingId) return existingId;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      email,
      email_confirm: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to create user: ${response.status} ${body}`);
  }

  const payload = await response.json();
  return payload?.id || null;
};

const readJson = async (path) => JSON.parse(await fs.readFile(new URL(path, import.meta.url), 'utf-8'));
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
const toDate = (value) => (value ? value.split('T')[0] : null);
const toTime = (value) => (value && value.length ? value : null);

const main = async () => {
  const ownerId = await createUserIfMissing(MASTER_EMAIL);
  if (!ownerId) {
    throw new Error(`Master user not found for email ${MASTER_EMAIL}.`);
  }

  let masterProfileId = null;
  const { data: existingProfiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('owner_id', ownerId)
    .limit(1);

  if (profileError) {
    throw new Error(`Failed to fetch profiles: ${profileError.message}`);
  }

  if (existingProfiles && existingProfiles.length > 0) {
    masterProfileId = existingProfiles[0].id;
  } else {
    const { error: insertProfileError } = await supabase.from('profiles').insert({
      id: ownerId,
      owner_id: ownerId,
      nome_restaurante: 'Master',
      cnpj: '00000000000000',
      plan_tier: 'multi',
    });

    if (insertProfileError) {
      throw new Error(`Failed to create master profile: ${insertProfileError.message}`);
    }

    const { data: newProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('owner_id', ownerId)
      .limit(1);

    masterProfileId = newProfiles?.[0]?.id || null;
  }

  if (!masterProfileId) {
    throw new Error('Unable to resolve master profile id.');
  }

  const stores = await readJson('./stores.json');
  const categories = await readJson('./categories.json');
  const settings = await readJson('./settings.json');
  const transactions = await readJson('./transactions.json');
  const employees = await readJson('./rhEmployees.json');
  const timeCards = await readJson('./rhTimeCards.json');
  const usuarios = await readJson('./usuarios.json');

  if (Array.isArray(stores) && stores.length) {
    const storeRows = stores
      .filter((store) => store?.name)
      .map((store) => ({
        profile_id: masterProfileId,
        name: store.name,
        location: store.location || null,
        external_id: store.id || null,
      }));

    if (storeRows.length) {
      const { error } = await supabase.from('stores').upsert(storeRows, {
        onConflict: 'profile_id,name',
      });
      if (error) throw new Error(`Failed to upsert stores: ${error.message}`);
    }
  }

  const categoryNames = new Set();
  categories?.forEach((cat) => cat?.name && categoryNames.add(cat.name));
  settings?.forEach((setting) => {
    if (Array.isArray(setting?.list)) {
      setting.list.forEach((name) => name && categoryNames.add(name));
    }
  });

  if (categoryNames.size > 0) {
    const categoryRows = Array.from(categoryNames).map((name) => ({
      profile_id: masterProfileId,
      name,
      source: 'firebase',
    }));

    const { error } = await supabase.from('finance_categories').upsert(categoryRows, {
      onConflict: 'profile_id,name',
    });
    if (error) throw new Error(`Failed to upsert finance categories: ${error.message}`);

    const { error: settingsError } = await supabase.from('app_settings').upsert(
      {
        profile_id: masterProfileId,
        key: 'finance_categories',
        value: { list: Array.from(categoryNames) },
      },
      { onConflict: 'profile_id,key' }
    );
    if (settingsError) throw new Error(`Failed to upsert app settings: ${settingsError.message}`);
  }

  if (Array.isArray(employees) && employees.length) {
    const employeeRows = employees
      .filter((employee) => employee?.name)
      .map((employee) => ({
        profile_id: masterProfileId,
        external_id: employee.id || null,
        email: employee.email || null,
        name: employee.name,
        role: employee.role || null,
        status: employee.status || null,
        created_at: employee.createdAt || null,
      }));

    if (employeeRows.length) {
      const { error } = await supabase.from('hr_employees').upsert(employeeRows, {
        onConflict: 'profile_id,email',
      });
      if (error) throw new Error(`Failed to upsert employees: ${error.message}`);
    }
  }

  if (Array.isArray(timeCards) && timeCards.length) {
    const timeCardRows = timeCards
      .filter((card) => card?.date)
      .map((card) => ({
        profile_id: masterProfileId,
        employee_external_id: card.employeeId || null,
        date: card.date,
        check_in: toTime(card.checkIn),
        check_out: toTime(card.checkOut),
        lunch_start: toTime(card.lunchStart),
        lunch_end: toTime(card.lunchEnd),
        hours_worked: card.hoursWorked ?? null,
        notes: card.notes || null,
        created_at: card.createdAt || null,
        updated_at: card.updatedAt || null,
      }));

    for (const batch of chunk(timeCardRows, 500)) {
      const { error } = await supabase.from('hr_time_cards').insert(batch);
      if (error) throw new Error(`Failed to insert time cards: ${error.message}`);
    }
  }

  if (Array.isArray(transactions) && transactions.length) {
    const transactionRows = transactions
      .filter((tx) => tx?.date && typeof tx?.value !== 'undefined')
      .map((tx) => ({
        profile_id: masterProfileId,
        store_external_id: tx.storeId || null,
        type: tx.type || 'Despesa',
        description: tx.description || null,
        date: tx.date,
        category: tx.category || null,
        value: tx.value ?? 0,
        is_paid: tx.isPaid ?? false,
        bank_id: tx.bankId || null,
        items: tx.items || null,
      }));

    for (const batch of chunk(transactionRows, 500)) {
      const { error } = await supabase.from('fin_transactions').insert(batch);
      if (error) throw new Error(`Failed to insert transactions: ${error.message}`);
    }
  }

  if (Array.isArray(usuarios) && usuarios.length) {
    const userMap = new Map();
    usuarios
      .filter((user) => user?.email)
      .forEach((user) => {
        userMap.set(user.email, {
          profile_id: masterProfileId,
          email: user.email,
          name: user.name || null,
          role: user.role || null,
          created_at: user.createdAt || null,
          source: 'firebase',
        });
      });

    const userRows = Array.from(userMap.values());

    if (userRows.length) {
      const { error } = await supabase.from('user_imports').upsert(userRows, {
        onConflict: 'profile_id,email',
      });
      if (error) throw new Error(`Failed to upsert user imports: ${error.message}`);
    }
  }

  console.log('Import completed successfully.');
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
