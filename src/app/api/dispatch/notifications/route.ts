import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

interface NotificationRow {
  id: number;
  recipient_type: string;
  recipient_id: number | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  type: string;
  title: string;
  message: string;
  booking_id: number | null;
  public_code: string | null;
  ride_id: number | null;
  channel: string;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  error_message: string | null;
  metadata: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recipientType = searchParams.get('recipientType');
  const recipientId = searchParams.get('recipientId');
  const status = searchParams.get('status');
  const channel = searchParams.get('channel');

  let whereClause = 'n.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)';
  const params: (string | number)[] = [];

  if (recipientType) {
    whereClause += ' AND n.recipient_type = ?';
    params.push(recipientType);
  }
  if (recipientId) {
    whereClause += ' AND n.recipient_id = ?';
    params.push(Number(recipientId));
  }
  if (status) {
    whereClause += ' AND n.status = ?';
    params.push(status);
  }
  if (channel) {
    whereClause += ' AND n.channel = ?';
    params.push(channel);
  }

  try {
    const notifications = await query<NotificationRow>(`
      SELECT
        n.id,
        n.recipient_type,
        n.recipient_id,
        n.recipient_email,
        n.recipient_phone,
        n.type,
        n.title,
        n.message,
        n.booking_id,
        b.public_code,
        n.ride_id,
        n.channel,
        n.status,
        n.sent_at,
        n.delivered_at,
        n.read_at,
        n.error_message,
        n.metadata,
        n.created_at
      FROM notifications n
      LEFT JOIN bookings b ON b.id = n.booking_id
      WHERE ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT 50
    `, params);

    return NextResponse.json({
      notifications: notifications.map((notif) => ({
        id: notif.id,
        recipientType: notif.recipient_type,
        recipientId: notif.recipient_id,
        recipientEmail: notif.recipient_email,
        recipientPhone: notif.recipient_phone,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        bookingId: notif.booking_id,
        bookingCode: notif.public_code,
        rideId: notif.ride_id,
        channel: notif.channel,
        status: notif.status,
        sentAt: notif.sent_at,
        deliveredAt: notif.delivered_at,
        readAt: notif.read_at,
        errorMessage: notif.error_message,
        metadata: notif.metadata ? JSON.parse(notif.metadata) : null,
        createdAt: notif.created_at,
      })),
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipientType,
      recipientId,
      recipientEmail,
      recipientPhone,
      type,
      title,
      message,
      bookingId,
      rideId,
      channel = 'IN_APP',
      metadata
    } = body;

    if (!recipientType || !type || !title || !message || !channel) {
      return NextResponse.json({ error: 'Missing required fields (recipientType, type, title, message, channel)' }, { status: 400 });
    }

    const insertId = await insert(
      `INSERT INTO notifications (recipient_type, recipient_id, recipient_email, recipient_phone, type, title, message, booking_id, ride_id, channel, status, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [recipientType, recipientId || null, recipientEmail || null, recipientPhone || null, type, title, message, bookingId || null, rideId || null, channel, 'PENDING', metadata ? JSON.stringify(metadata) : null]
    );

    return NextResponse.json({ success: true, notificationId: insertId });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ids, status, markAsRead } = body;

    if (markAsRead) {
      // Mark as read
      if (ids && Array.isArray(ids) && ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        await query(`UPDATE notifications SET status = 'READ', read_at = NOW() WHERE id IN (${placeholders})`, ids);
      } else if (id) {
        await query(`UPDATE notifications SET status = 'READ', read_at = NOW() WHERE id = ?`, [id]);
      } else {
        return NextResponse.json({ error: 'No notification specified' }, { status: 400 });
      }
    } else if (status) {
      // Update status
      const updates: string[] = ['status = ?'];
      const values: (string | number)[] = [status];

      if (status === 'SENT') {
        updates.push('sent_at = NOW()');
      } else if (status === 'DELIVERED') {
        updates.push('delivered_at = NOW()');
      } else if (status === 'READ') {
        updates.push('read_at = NOW()');
      }

      if (ids && Array.isArray(ids) && ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        await query(`UPDATE notifications SET ${updates.join(', ')} WHERE id IN (${placeholders})`, [...values, ...ids]);
      } else if (id) {
        values.push(id);
        await query(`UPDATE notifications SET ${updates.join(', ')} WHERE id = ?`, values);
      } else {
        return NextResponse.json({ error: 'No notification specified' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'No update action specified' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
