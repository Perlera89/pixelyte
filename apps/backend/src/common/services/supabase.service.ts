import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadImage(
    file: Express.Multer.File,
    bucket: string = 'images',
    folder?: string,
  ): Promise<string> {
    try {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw new BadRequestException(
          `Error uploading image: ${error.message}`,
        );
      }

      const { data: publicUrlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      try {
        const response = await fetch(publicUrlData.publicUrl, {
          method: 'HEAD',
        });
        if (response.ok) {
          return publicUrlData.publicUrl;
        }
      } catch (fetchError) {
        console.warn('Public URL not accessible, bucket might not be public');
      }

      const { data: signedUrlData, error: signedError } =
        await this.supabase.storage
          .from(bucket)
          .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year expiration

      if (signedError) {
        throw new BadRequestException(
          `Error creating signed URL: ${signedError.message}`,
        );
      }

      return signedUrlData.signedUrl;
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteImage(url: string, bucket: string = 'images'): Promise<void> {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex((part) => part === bucket);
      if (bucketIndex === -1) return;

      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error.message);
      }
    } catch (error) {
      console.error('Failed to delete image:', error.message);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    bucket: string = 'images',
    folder?: string,
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file, bucket, folder),
    );

    return Promise.all(uploadPromises);
  }
}
