import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency, canManageAgency } from '@/lib/agency-auth';
import { query, queryOne } from '@/lib/db';

interface WhiteLabelRow {
  custom_domain: string | null;
  subdomain: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  company_name: string | null;
  tagline: string | null;
  footer_text: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  show_powered_by: boolean;
  show_reviews: boolean;
  show_suppliers: boolean;
  meta_title: string | null;
  meta_description: string | null;
  google_analytics: string | null;
  facebook_pixel: string | null;
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth.payload;

  const config = await queryOne<WhiteLabelRow>(
    `SELECT custom_domain, subdomain, logo_url, favicon_url,
            primary_color, secondary_color, accent_color,
            company_name, tagline, footer_text, contact_email, contact_phone,
            show_powered_by, show_reviews, show_suppliers,
            meta_title, meta_description, google_analytics, facebook_pixel
     FROM agency_whitelabel
     WHERE agency_id = ?`,
    [agencyId]
  );

  if (!config) {
    return NextResponse.json({
      customDomain: '',
      subdomain: '',
      logoUrl: '',
      faviconUrl: '',
      primaryColor: '#0EA5E9',
      secondaryColor: '#64748B',
      accentColor: '#F59E0B',
      companyName: '',
      tagline: '',
      footerText: '',
      contactEmail: '',
      contactPhone: '',
      showPoweredBy: true,
      showReviews: true,
      showSuppliers: false,
      metaTitle: '',
      metaDescription: '',
      googleAnalytics: '',
      facebookPixel: '',
    });
  }

  return NextResponse.json({
    customDomain: config.custom_domain || '',
    subdomain: config.subdomain || '',
    logoUrl: config.logo_url || '',
    faviconUrl: config.favicon_url || '',
    primaryColor: config.primary_color,
    secondaryColor: config.secondary_color,
    accentColor: config.accent_color,
    companyName: config.company_name || '',
    tagline: config.tagline || '',
    footerText: config.footer_text || '',
    contactEmail: config.contact_email || '',
    contactPhone: config.contact_phone || '',
    showPoweredBy: config.show_powered_by,
    showReviews: config.show_reviews,
    showSuppliers: config.show_suppliers,
    metaTitle: config.meta_title || '',
    metaDescription: config.meta_description || '',
    googleAnalytics: config.google_analytics || '',
    facebookPixel: config.facebook_pixel || '',
  });
}

export async function PUT(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId, agencyRole } = auth.payload;

  if (!canManageAgency(agencyRole)) {
    return NextResponse.json(
      { error: 'Only owners and managers can update white label settings' },
      { status: 403 }
    );
  }

  const body = await request.json();

  // Check if config exists
  const existing = await queryOne(
    'SELECT id FROM agency_whitelabel WHERE agency_id = ?',
    [agencyId]
  );

  if (existing) {
    await query(
      `UPDATE agency_whitelabel SET
         custom_domain = ?, subdomain = ?, logo_url = ?, favicon_url = ?,
         primary_color = ?, secondary_color = ?, accent_color = ?,
         company_name = ?, tagline = ?, footer_text = ?,
         contact_email = ?, contact_phone = ?,
         show_powered_by = ?, show_reviews = ?, show_suppliers = ?,
         meta_title = ?, meta_description = ?,
         google_analytics = ?, facebook_pixel = ?,
         updated_at = NOW()
       WHERE agency_id = ?`,
      [
        body.customDomain || null,
        body.subdomain || null,
        body.logoUrl || null,
        body.faviconUrl || null,
        body.primaryColor || '#0EA5E9',
        body.secondaryColor || '#64748B',
        body.accentColor || '#F59E0B',
        body.companyName || null,
        body.tagline || null,
        body.footerText || null,
        body.contactEmail || null,
        body.contactPhone || null,
        body.showPoweredBy !== false,
        body.showReviews !== false,
        body.showSuppliers === true,
        body.metaTitle || null,
        body.metaDescription || null,
        body.googleAnalytics || null,
        body.facebookPixel || null,
        agencyId,
      ]
    );
  } else {
    await query(
      `INSERT INTO agency_whitelabel (
         agency_id, custom_domain, subdomain, logo_url, favicon_url,
         primary_color, secondary_color, accent_color,
         company_name, tagline, footer_text, contact_email, contact_phone,
         show_powered_by, show_reviews, show_suppliers,
         meta_title, meta_description, google_analytics, facebook_pixel
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agencyId,
        body.customDomain || null,
        body.subdomain || null,
        body.logoUrl || null,
        body.faviconUrl || null,
        body.primaryColor || '#0EA5E9',
        body.secondaryColor || '#64748B',
        body.accentColor || '#F59E0B',
        body.companyName || null,
        body.tagline || null,
        body.footerText || null,
        body.contactEmail || null,
        body.contactPhone || null,
        body.showPoweredBy !== false,
        body.showReviews !== false,
        body.showSuppliers === true,
        body.metaTitle || null,
        body.metaDescription || null,
        body.googleAnalytics || null,
        body.facebookPixel || null,
      ]
    );
  }

  return NextResponse.json({ success: true });
}
