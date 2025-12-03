import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

interface MessageRow {
  id: number;
  sender_type: string;
  sender_id: number | null;
  sender_name: string;
  message: string;
  message_type: string;
  attachment_url: string | null;
  location_lat: number | null;
  location_lng: number | null;
  is_read: number;
  created_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  try {
    const messages = await query<MessageRow>(`
      SELECT
        m.id,
        m.sender_type,
        m.sender_id,
        CASE
          WHEN m.sender_type = 'CUSTOMER' THEN COALESCE(bp.full_name, 'Customer')
          WHEN m.sender_type = 'DRIVER' THEN COALESCE(d.full_name, 'Driver')
          WHEN m.sender_type = 'DISPATCHER' THEN COALESCE(u.name, 'Dispatcher')
          ELSE 'System'
        END as sender_name,
        m.message,
        m.message_type,
        m.attachment_url,
        m.location_lat,
        m.location_lng,
        m.is_read,
        m.created_at
      FROM messages m
      LEFT JOIN booking_passengers bp ON bp.booking_id = m.booking_id AND bp.is_lead = TRUE AND m.sender_type = 'CUSTOMER'
      LEFT JOIN rides r ON r.booking_id = m.booking_id
      LEFT JOIN drivers d ON d.id = r.driver_id AND m.sender_type = 'DRIVER'
      LEFT JOIN users u ON u.id = m.sender_id AND m.sender_type = 'DISPATCHER'
      WHERE m.booking_id = ?
      ORDER BY m.created_at ASC
      LIMIT 200
    `, [bookingId]);

    // Mark messages as read for dispatcher
    await query(`
      UPDATE messages SET is_read = TRUE
      WHERE booking_id = ? AND sender_type != 'DISPATCHER' AND is_read = FALSE
    `, [bookingId]);

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg.id,
        senderType: msg.sender_type,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        message: msg.message,
        messageType: msg.message_type,
        attachmentUrl: msg.attachment_url,
        locationLat: msg.location_lat,
        locationLng: msg.location_lng,
        isRead: msg.is_read === 1,
        createdAt: msg.created_at,
      })),
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  try {
    const body = await request.json();
    const { message, messageType = 'TEXT', attachmentUrl, locationLat, locationLng, senderId } = body;

    if (!message && messageType === 'TEXT') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const insertId = await insert(
      `INSERT INTO messages (booking_id, sender_type, sender_id, message, message_type, attachment_url, location_lat, location_lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, 'DISPATCHER', senderId || null, message || '', messageType, attachmentUrl || null, locationLat || null, locationLng || null]
    );

    return NextResponse.json({ success: true, messageId: insertId });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
