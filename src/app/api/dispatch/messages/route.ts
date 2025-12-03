import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ConversationRow {
  id: number;
  booking_id: number;
  public_code: string;
  customer_name: string;
  driver_name: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: string;
}

export async function GET() {
  try {
    const conversations = await query<ConversationRow>(`
      SELECT
        m.booking_id as id,
        m.booking_id,
        b.public_code,
        bp.full_name as customer_name,
        d.full_name as driver_name,
        (
          SELECT message FROM messages
          WHERE booking_id = m.booking_id
          ORDER BY created_at DESC LIMIT 1
        ) as last_message,
        MAX(m.created_at) as last_message_time,
        SUM(CASE WHEN m.is_read = FALSE AND m.sender_type != 'DISPATCHER' THEN 1 ELSE 0 END) as unread_count,
        r.status
      FROM messages m
      JOIN bookings b ON b.id = m.booking_id
      LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
      LEFT JOIN rides r ON r.booking_id = b.id
      LEFT JOIN drivers d ON d.id = r.driver_id
      WHERE m.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY m.booking_id, b.public_code, bp.full_name, d.full_name, r.status
      ORDER BY last_message_time DESC
      LIMIT 50
    `);

    return NextResponse.json({
      conversations: conversations.map((conv) => ({
        id: conv.id,
        bookingId: conv.booking_id,
        bookingCode: conv.public_code,
        customerName: conv.customer_name || 'Guest',
        driverName: conv.driver_name,
        lastMessage: conv.last_message || '',
        lastMessageTime: conv.last_message_time,
        unreadCount: Number(conv.unread_count) || 0,
        status: conv.status || 'UNKNOWN',
      })),
    });
  } catch (error) {
    console.error('Messages conversations error:', error);
    return NextResponse.json({ conversations: [] });
  }
}
