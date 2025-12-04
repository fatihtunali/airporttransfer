import { NextRequest } from 'next/server';
import { queryOne } from '@/lib/db';

interface RideTrackingData {
  ride_id: number;
  booking_id: number;
  ride_status: string;
  driver_id: number | null;
  driver_name: string | null;
  driver_phone: string | null;
  driver_photo: string | null;
  vehicle_plate: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  driver_lat: number | null;
  driver_lng: number | null;
  driver_heading: number | null;
  driver_speed: number | null;
  driver_status: string | null;
  eta_minutes: number | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  pickup_address: string | null;
  dropoff_address: string | null;
  airport_name: string | null;
  zone_name: string | null;
  last_event: string | null;
  last_event_time: string | null;
}

// GET /api/tracking/[bookingCode] - SSE stream for real-time tracking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingCode: string }> }
) {
  const { bookingCode } = await params;

  if (!bookingCode) {
    return new Response(JSON.stringify({ error: 'Booking code required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Set up SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isActive = true;

      const sendEvent = (data: object) => {
        if (!isActive) return;
        const message = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(message));
        } catch {
          isActive = false;
        }
      };

      const fetchAndSend = async () => {
        if (!isActive) return;

        try {
          const data = await queryOne<RideTrackingData>(`
            SELECT
              r.id as ride_id,
              r.booking_id,
              r.status as ride_status,
              r.driver_id,
              d.full_name as driver_name,
              d.phone as driver_phone,
              d.photo_url as driver_photo,
              d.vehicle_plate,
              d.vehicle_model,
              d.vehicle_color,
              dl.latitude as driver_lat,
              dl.longitude as driver_lng,
              dl.heading as driver_heading,
              dl.speed as driver_speed,
              dl.status as driver_status,
              r.driver_eta_minutes as eta_minutes,
              z.latitude as pickup_lat,
              z.longitude as pickup_lng,
              NULL as dropoff_lat,
              NULL as dropoff_lng,
              b.pickup_address,
              b.dropoff_address,
              a.name as airport_name,
              z.name as zone_name,
              rt.event_type as last_event,
              rt.created_at as last_event_time
            FROM bookings b
            JOIN rides r ON r.booking_id = b.id
            LEFT JOIN drivers d ON d.id = r.driver_id
            LEFT JOIN driver_locations dl ON dl.driver_id = r.driver_id
            LEFT JOIN airports a ON a.id = b.airport_id
            LEFT JOIN zones z ON z.id = b.zone_id
            LEFT JOIN (
              SELECT ride_id, event_type, created_at
              FROM ride_tracking
              WHERE ride_id = r.id
              ORDER BY created_at DESC
              LIMIT 1
            ) rt ON rt.ride_id = r.id
            WHERE b.public_code = ?
          `, [bookingCode]);

          if (data) {
            sendEvent({
              type: 'location_update',
              timestamp: new Date().toISOString(),
              booking: {
                code: bookingCode,
                status: data.ride_status,
              },
              driver: data.driver_id ? {
                id: data.driver_id,
                name: data.driver_name,
                phone: data.driver_phone,
                photo: data.driver_photo,
                vehicle: {
                  plate: data.vehicle_plate,
                  model: data.vehicle_model,
                  color: data.vehicle_color,
                },
                location: data.driver_lat ? {
                  lat: data.driver_lat,
                  lng: data.driver_lng,
                  heading: data.driver_heading,
                  speed: data.driver_speed,
                  status: data.driver_status,
                } : null,
                eta: data.eta_minutes,
              } : null,
              route: {
                pickup: {
                  address: data.pickup_address || data.airport_name,
                  lat: data.pickup_lat,
                  lng: data.pickup_lng,
                },
                dropoff: {
                  address: data.dropoff_address || data.zone_name,
                  lat: data.dropoff_lat,
                  lng: data.dropoff_lng,
                },
              },
              lastEvent: data.last_event ? {
                type: data.last_event,
                time: data.last_event_time,
              } : null,
            });
          } else {
            sendEvent({
              type: 'error',
              message: 'Booking not found'
            });
            isActive = false;
          }
        } catch (error) {
          console.error('Tracking error:', error);
          sendEvent({
            type: 'error',
            message: 'Failed to fetch tracking data'
          });
        }
      };

      // Initial fetch
      await fetchAndSend();

      // Poll every 5 seconds
      const interval = setInterval(async () => {
        if (!isActive) {
          clearInterval(interval);
          return;
        }
        await fetchAndSend();
      }, 5000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        isActive = false;
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
