import http from 'node:http';
import { randomUUID } from 'node:crypto';

const port = Number(process.env.PORT ?? 3001);

const cors = {
  allowOrigin: process.env.CORS_ORIGIN ?? '*',
  allowHeaders: 'content-type',
  allowMethods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

const json = (res, status, data) => {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'access-control-allow-origin': cors.allowOrigin,
    'access-control-allow-headers': cors.allowHeaders,
    'access-control-allow-methods': cors.allowMethods,
  });
  res.end(body);
};

const noContent = (res, status = 204) => {
  res.writeHead(status, {
    'access-control-allow-origin': cors.allowOrigin,
    'access-control-allow-headers': cors.allowHeaders,
    'access-control-allow-methods': cors.allowMethods,
  });
  res.end();
};

const text = (res, status, body) => {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'access-control-allow-origin': cors.allowOrigin,
    'access-control-allow-headers': cors.allowHeaders,
    'access-control-allow-methods': cors.allowMethods,
  });
  res.end(body);
};

const readJsonBody = async (req) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    chunks.push(chunk);
    size += chunk.length;
    if (size > 2 * 1024 * 1024) throw new Error('BodyTooLarge');
  }
  if (chunks.length === 0) return null;
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return null;
  return JSON.parse(raw);
};

const paginate = (items, page, limit) => {
  const safeLimit = Math.max(1, Math.min(200, Number.isFinite(limit) ? limit : 20));
  const safePage = Math.max(1, Number.isFinite(page) ? page : 1);
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;
  return {
    items: items.slice(start, end),
    page: safePage,
    limit: safeLimit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / safeLimit)),
  };
};

const uuid = () => {
  try {
    return randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

const seedRooms = () => {
  const typeOptions = ['Single', 'Double', 'VIP', 'Studio'];
  return Array.from({ length: 200 }, (_, i) => {
    const id = String(i + 1);
    const type = typeOptions[i % 4];
    const status = i % 10 === 0 ? 'vacant' : i % 15 === 0 ? 'maint' : 'occupied';
    return {
      id,
      status,
      type,
      price: i % 4 === 0 ? '5,000,000' : '3,500,000',
      tenant: status === 'occupied' ? `Tenant ${id}` : null,
      issue: status === 'maint' ? 'Air conditioner issue' : null,
    };
  });
};

const seedTenants = () => {
  const colors = ['orange', 'teal', 'blue', 'purple', 'green'];
  const statuses = ['active', 'active', 'active', 'expiring', 'past'];
  return Array.from({ length: 40 }, (_, i) => {
    const id = i + 1;
    const status = statuses[i % statuses.length];
    return {
      id: String(id),
      name: `Tenant ${id}`,
      email: `tenant${id}@example.com`,
      room: String(1 + (i % 200)),
      phone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      period: 'Jan 12, 2023 - Jan 11, 2024',
      deposit: `$${(1000 + i * 50).toLocaleString()}.00`,
      status,
      avatarColor: colors[i % colors.length],
    };
  });
};

const seedInvoices = () => {
  return [
    { id: uuid(), room: '101', tenant: 'John Doe', month: 'Nov 2023', total: '$1,250.00', status: 'paid' },
    { id: uuid(), room: '102', tenant: 'Sarah Jenkins', month: 'Nov 2023', total: '$1,420.00', status: 'unpaid' },
    { id: uuid(), room: '103', tenant: 'Michael Brown', month: 'Nov 2023', total: '$1,850.00', status: 'partial' },
    { id: uuid(), room: '104', tenant: 'David Wilson', month: 'Nov 2023', total: '$1,100.00', status: 'paid' },
    { id: uuid(), room: '105', tenant: 'Emily Davis', month: 'Nov 2023', total: '$1,380.00', status: 'unpaid' },
  ];
};

const seedMaintenance = () => {
  return [
    {
      id: uuid(),
      room: 'Room 104',
      urgency: 'HIGH URGENCY',
      time: '2 HRS AGO',
      type: 'Plumbing Leak',
      desc: 'The kitchen sink pipe has a major leak, water is pooling on the floor and spreading to the living room. Immediate attention needed to prevent wood floor damage.',
      status: 'PENDING',
      reporter: 'Sarah J.',
      assigned: null,
      color: 'red',
    },
    {
      id: uuid(),
      room: 'Room 205',
      urgency: 'MEDIUM',
      time: '5 HRS AGO',
      type: 'Light Flicker',
      desc: 'The main light in the bedroom keeps flickering when turned on. Might be a switch or bulb issue. Tenant requests inspection and replacement if needed.',
      status: 'IN PROGRESS',
      reporter: null,
      assigned: 'Eric W.',
      color: 'blue',
    },
    {
      id: uuid(),
      room: 'Room 302',
      urgency: 'LOW',
      time: '1 DAY AGO',
      type: 'Door Squeak',
      desc: 'Bathroom door hinges are very squeaky. Needs oiling or replacement. Not affecting functionality but causing annoyance.',
      status: 'COMPLETED',
      reporter: 'Admin',
      assigned: null,
      color: 'gray',
    },
    {
      id: uuid(),
      room: 'Room 112',
      urgency: 'HIGH URGENCY',
      time: '8 HRS AGO',
      type: 'AC Not Cooling',
      desc: 'AC unit is blowing warm air even at the lowest temperature setting. Possibly low on refrigerant or compressor issue. Hot weather, urgent repair needed.',
      status: 'PENDING',
      reporter: 'John D.',
      assigned: null,
      color: 'red',
    },
  ];
};

const seedReports = () => {
  return {
    revenue: [
      { month: 'Jan', thisYear: 15000, lastYear: 11000 },
      { month: 'Feb', thisYear: 19000, lastYear: 12500 },
      { month: 'Mar', thisYear: 22000, lastYear: 11000 },
      { month: 'Apr', thisYear: 18000, lastYear: 14000 },
      { month: 'May', thisYear: 24000, lastYear: 12500 },
      { month: 'Jun', thisYear: 30000, lastYear: 14500 },
      { month: 'Jul', thisYear: 34000, lastYear: 16500 },
    ],
    expenses: [
      { name: 'Maintenance', value: 4980, color: '#3b82f6' },
      { name: 'Utilities', value: 3112, color: '#10b981' },
      { name: 'Staff', value: 2490, color: '#f59e0b' },
      { name: 'Taxes', value: 1868, color: '#ef4444' },
    ],
    totalExpense: 12450,
  };
};

const db = {
  rooms: seedRooms(),
  tenants: seedTenants(),
  invoices: seedInvoices(),
  maintenance: seedMaintenance(),
  reports: seedReports(),
};

const parsePath = (pathname) => pathname.replace(/\/+$/, '') || '/';

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) return text(res, 400, 'Bad Request');

    if (req.method === 'OPTIONS') return noContent(res, 204);

    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    const pathname = parsePath(url.pathname);

    if (pathname === '/' || pathname === '/health') {
      return json(res, 200, { ok: true, name: 'phong-tro-v1-be', time: new Date().toISOString() });
    }

    if (!pathname.startsWith('/api')) return text(res, 404, 'Not Found');

    const parts = pathname.split('/').filter(Boolean);
    const resource = parts[1];
    const id = parts[2] ?? null;

    if (resource === 'rooms') {
      if (req.method === 'GET' && !id) {
        const search = (url.searchParams.get('search') ?? '').trim();
        const status = (url.searchParams.get('status') ?? 'all').trim();
        const type = (url.searchParams.get('type') ?? 'all').trim();
        const page = Number(url.searchParams.get('page') ?? '1');
        const limit = Number(url.searchParams.get('limit') ?? '200');

        let items = db.rooms;
        if (search) items = items.filter((r) => r.id.includes(search));
        if (status !== 'all') items = items.filter((r) => r.status === status);
        if (type !== 'all') items = items.filter((r) => r.type === type);

        return json(res, 200, paginate(items, page, limit));
      }

      if (req.method === 'GET' && id) {
        const room = db.rooms.find((r) => r.id === id);
        if (!room) return json(res, 404, { error: 'ROOM_NOT_FOUND' });
        return json(res, 200, room);
      }

      if (req.method === 'POST' && !id) {
        const body = await readJsonBody(req);
        if (!body || typeof body !== 'object') return json(res, 400, { error: 'INVALID_BODY' });

        const next = {
          id: String(body.id ?? String(db.rooms.length + 1)),
          status: body.status ?? 'vacant',
          type: body.type ?? 'Single',
          price: body.price ?? '0',
          tenant: body.tenant ?? null,
          issue: body.issue ?? null,
        };

        if (db.rooms.some((r) => r.id === next.id)) return json(res, 409, { error: 'ROOM_ID_EXISTS' });
        db.rooms.unshift(next);
        return json(res, 201, next);
      }

      if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
        const idx = db.rooms.findIndex((r) => r.id === id);
        if (idx === -1) return json(res, 404, { error: 'ROOM_NOT_FOUND' });
        const body = await readJsonBody(req);
        if (!body || typeof body !== 'object') return json(res, 400, { error: 'INVALID_BODY' });

        db.rooms[idx] = {
          ...db.rooms[idx],
          ...body,
          id,
        };
        return json(res, 200, db.rooms[idx]);
      }

      if (req.method === 'DELETE' && id) {
        const idx = db.rooms.findIndex((r) => r.id === id);
        if (idx === -1) return json(res, 404, { error: 'ROOM_NOT_FOUND' });
        const removed = db.rooms.splice(idx, 1)[0];
        return json(res, 200, removed);
      }

      return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
    }

    if (resource === 'tenants') {
      if (req.method === 'GET' && !id) {
        const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
        const status = (url.searchParams.get('status') ?? 'all').trim();
        const page = Number(url.searchParams.get('page') ?? '1');
        const limit = Number(url.searchParams.get('limit') ?? '20');

        let items = db.tenants;
        if (status !== 'all') items = items.filter((t) => t.status === status);
        if (search) {
          items = items.filter((t) => t.name.toLowerCase().includes(search) || t.room.includes(search));
        }

        return json(res, 200, paginate(items, page, limit));
      }

      if (req.method === 'GET' && id) {
        const tenant = db.tenants.find((t) => t.id === id);
        if (!tenant) return json(res, 404, { error: 'TENANT_NOT_FOUND' });
        return json(res, 200, tenant);
      }

      if (req.method === 'POST' && !id) {
        const body = await readJsonBody(req);
        if (!body || typeof body !== 'object') return json(res, 400, { error: 'INVALID_BODY' });
        const next = {
          id: uuid(),
          name: String(body.name ?? ''),
          email: String(body.email ?? ''),
          room: String(body.room ?? ''),
          phone: String(body.phone ?? ''),
          period: String(body.period ?? ''),
          deposit: String(body.deposit ?? ''),
          status: body.status ?? 'active',
          avatarColor: body.avatarColor ?? 'blue',
        };
        db.tenants.unshift(next);
        return json(res, 201, next);
      }

      if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
        const idx = db.tenants.findIndex((t) => t.id === id);
        if (idx === -1) return json(res, 404, { error: 'TENANT_NOT_FOUND' });
        const body = await readJsonBody(req);
        if (!body || typeof body !== 'object') return json(res, 400, { error: 'INVALID_BODY' });
        db.tenants[idx] = { ...db.tenants[idx], ...body, id };
        return json(res, 200, db.tenants[idx]);
      }

      if (req.method === 'DELETE' && id) {
        const idx = db.tenants.findIndex((t) => t.id === id);
        if (idx === -1) return json(res, 404, { error: 'TENANT_NOT_FOUND' });
        const removed = db.tenants.splice(idx, 1)[0];
        return json(res, 200, removed);
      }

      return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
    }

    if (resource === 'invoices') {
      if (req.method === 'GET' && !id) {
        const status = (url.searchParams.get('status') ?? 'all').trim();
        const month = (url.searchParams.get('month') ?? '').trim();
        const page = Number(url.searchParams.get('page') ?? '1');
        const limit = Number(url.searchParams.get('limit') ?? '50');

        let items = db.invoices;
        if (status !== 'all') items = items.filter((i) => i.status === status);
        if (month) items = items.filter((i) => i.month === month);

        return json(res, 200, paginate(items, page, limit));
      }

      if (req.method === 'GET' && id) {
        const invoice = db.invoices.find((i) => i.id === id);
        if (!invoice) return json(res, 404, { error: 'INVOICE_NOT_FOUND' });
        return json(res, 200, invoice);
      }

      if (req.method === 'POST' && !id) {
        const body = await readJsonBody(req);
        if (!body || typeof body !== 'object') return json(res, 400, { error: 'INVALID_BODY' });
        const next = {
          id: uuid(),
          room: String(body.room ?? ''),
          tenant: String(body.tenant ?? ''),
          month: String(body.month ?? ''),
          total: String(body.total ?? ''),
          status: body.status ?? 'unpaid',
        };
        db.invoices.unshift(next);
        return json(res, 201, next);
      }

      if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
        const idx = db.invoices.findIndex((i) => i.id === id);
        if (idx === -1) return json(res, 404, { error: 'INVOICE_NOT_FOUND' });
        const body = await readJsonBody(req);
        if (!body || typeof body !== 'object') return json(res, 400, { error: 'INVALID_BODY' });
        db.invoices[idx] = { ...db.invoices[idx], ...body, id };
        return json(res, 200, db.invoices[idx]);
      }

      if (req.method === 'DELETE' && id) {
        const idx = db.invoices.findIndex((i) => i.id === id);
        if (idx === -1) return json(res, 404, { error: 'INVOICE_NOT_FOUND' });
        const removed = db.invoices.splice(idx, 1)[0];
        return json(res, 200, removed);
      }

      return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
    }

    if (resource === 'maintenance') {
      if (req.method === 'GET' && !id) {
        const status = (url.searchParams.get('status') ?? 'all').trim().toUpperCase();
        const urgency = (url.searchParams.get('urgency') ?? 'all').trim().toUpperCase();
        const page = Number(url.searchParams.get('page') ?? '1');
        const limit = Number(url.searchParams.get('limit') ?? '50');

        let items = db.maintenance;
        if (status !== 'ALL') items = items.filter((r) => r.status.toUpperCase() === status);
        if (urgency !== 'ALL') items = items.filter((r) => r.urgency.toUpperCase() === urgency);

        return json(res, 200, paginate(items, page, limit));
      }

      if (req.method === 'GET' && id) {
        const reqItem = db.maintenance.find((r) => r.id === id);
        if (!reqItem) return json(res, 404, { error: 'MAINT_NOT_FOUND' });
        return json(res, 200, reqItem);
      }

      if (req.method === 'POST' && !id) {
        const body = await readJsonBody(req);
        if (!body || typeof body !== 'object') return json(res, 400, { error: 'INVALID_BODY' });
        const next = {
          id: uuid(),
          room: String(body.room ?? 'Room'),
          urgency: String(body.urgency ?? 'MEDIUM'),
          time: String(body.time ?? 'NOW'),
          type: String(body.type ?? 'General'),
          desc: String(body.desc ?? ''),
          status: String(body.status ?? 'PENDING'),
          reporter: body.reporter ?? null,
          assigned: body.assigned ?? null,
          color: body.color ?? 'blue',
        };
        db.maintenance.unshift(next);
        return json(res, 201, next);
      }

      if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
        const idx = db.maintenance.findIndex((r) => r.id === id);
        if (idx === -1) return json(res, 404, { error: 'MAINT_NOT_FOUND' });
        const body = await readJsonBody(req);
        if (!body || typeof body !== 'object') return json(res, 400, { error: 'INVALID_BODY' });
        db.maintenance[idx] = { ...db.maintenance[idx], ...body, id };
        return json(res, 200, db.maintenance[idx]);
      }

      if (req.method === 'DELETE' && id) {
        const idx = db.maintenance.findIndex((r) => r.id === id);
        if (idx === -1) return json(res, 404, { error: 'MAINT_NOT_FOUND' });
        const removed = db.maintenance.splice(idx, 1)[0];
        return json(res, 200, removed);
      }

      return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
    }

    if (resource === 'reports') {
      if (req.method === 'GET') {
        return json(res, 200, db.reports);
      }
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const body = await readJsonBody(req);
        if (!body || typeof body !== 'object') return json(res, 400, { error: 'INVALID_BODY' });
        db.reports = { ...db.reports, ...body };
        return json(res, 200, db.reports);
      }
      return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
    }

    return json(res, 404, { error: 'NOT_FOUND' });
  } catch (err) {
    if (err instanceof SyntaxError) return json(res, 400, { error: 'INVALID_JSON' });
    if (err instanceof Error && err.message === 'BodyTooLarge') return json(res, 413, { error: 'BODY_TOO_LARGE' });
    return json(res, 500, { error: 'INTERNAL_ERROR' });
  }
});

server.listen(port, () => {
  console.log(`BE listening on http://localhost:${port}`);
});
