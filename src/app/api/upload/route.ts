import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'property-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTOS_FREE = 20;

// Ensure the storage bucket exists (created once by admin client)
async function ensureBucket() {
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(BUCKET);
  if (!data) {
    await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const propertyId = formData.get('propertyId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Le fichier dépasse 5 Mo' }, { status: 400 });
    }

    // Check current photo count across all user properties for free plan users
    if (propertyId) {
      // Check subscription status — premium and pro users have unlimited photos
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user.id)
        .single();

      const plan = subscription?.plan ?? 'free';
      const isActive = subscription?.status === 'active';
      const isPaid = (plan === 'premium' || plan === 'pro') && isActive;

      if (!isPaid) {
        // Count total photos across all of the user's properties
        const { data: properties } = await supabase
          .from('properties')
          .select('images')
          .eq('user_id', user.id);

        const totalPhotos = (properties || []).reduce(
          (sum, p) => sum + (p.images || []).length,
          0,
        );

        if (totalPhotos >= MAX_PHOTOS_FREE) {
          return NextResponse.json(
            { error: `Limite de ${MAX_PHOTOS_FREE} photos atteinte. Passez à un abonnement Premium ou Pro pour un nombre illimité de photos.` },
            { status: 403 }
          );
        }
      }
    }

    await ensureBucket();

    // Upload to Supabase Storage
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, path });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
