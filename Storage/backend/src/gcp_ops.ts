import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

class GCP_OPS {
  static storage: Storage = new Storage({apiKey:process.env.GCP_API_KEY})
  static bucket_name: string = process.env.GCP_BUCKET_NAME || "my_cloud_storage"

  public static place = async (
    uid: string,
    file: Express.Multer.File,
    filename: string,
    onComplete: (isError: boolean, url_or_error: any|null) => void
  ) => {
    
    try {
      
      const bucket = this.storage.bucket(this.bucket_name);
      const blob = bucket.file(uid + "/" + filename);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });

      blobStream.on('error', (err) => {
        onComplete(true, "Place operation failed, please try after sometime");
        console.log(err);
      });

      blobStream.on('finish', () => {
        onComplete(false, blob.publicUrl());
      })

      blobStream.end(file.buffer);

    } catch(e) {
      console.log(e);
      onComplete(true, "Place operation failed, please try after sometime");
    }
  }

  public static retrieve = async (
    uid: string,
    filename: string,
    onComplete: (isError: boolean, file: string|null) => void
  ) => {
    try {
      const bucket = this.storage.bucket(this.bucket_name);
      const file = bucket.file(uid + "/" + filename);
      const [exists] = await file.exists();

      if(!exists) {
        onComplete(true, "Retrieve operation failed, file not found");
        return;
      }
      
      try {
        onComplete(false, (await file.download()).toString());
      } catch(e) {
        onComplete(true, "Retrieve operation failed, please try after sometime");
      }

    } catch(e) {
      console.log("Object might not be present");
      onComplete(true,`${e}`);
      
    } finally { return; }
  }

  public static truncate = async (
    uid: string,
    filename: string,
    onComplete: (isError: boolean) => void
  ) => {
    try {
      const bucket = this.storage.bucket(this.bucket_name);
      const file = bucket.file(uid + "/" + filename);

      if(!file.exists) {
        onComplete(true);
        return;
      }
      
      try {
        await file.delete();
        onComplete(false);

      } catch(e) { onComplete(true); }

    } catch(e) {
      console.log(e);
      onComplete(true);
      
    } finally { return; }
  }
}

export default GCP_OPS;