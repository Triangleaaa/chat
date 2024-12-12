import { IncomingForm } from 'formidable';
import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: 'your-cloud-name',
  api_key: 'your-api-key',
  api_secret: 'your-api-secret',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  const form = new IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'File upload failed.' });
    }

    const file = files.avatar[0];

    cloudinary.v2.uploader.upload(file.filepath, (error, result) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'Cloudinary upload failed.' });
      }

      return res.status(200).json({ success: true, avatarUrl: result.secure_url });
    });
  });
}
