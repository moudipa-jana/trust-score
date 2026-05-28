import type { NextApiRequest, NextApiResponse } from 'next';
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
} from '@aws-sdk/client-rekognition';

const client = new RekognitionClient({
  region: process.env.AWS_MODRATION_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_MODRATION_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_MODRATION_SECRET_ACCESS_KEY || '',
  },
});

const blockedCategories = [
  // Sexual / Nudity
  'Explicit Nudity',
  'Graphic Male Nudity',
  'Graphic Female Nudity',
  'Sexual Activity',
  'Sexual Content',
  'Non-Explicit Nudity',
  'Implied Nudity',
  'Partial Nudity',
  'Kissing',
  'Suggestive',
  'Suggestive Appearance',
  'Revealing Clothes',

  // Violence
  'Graphic Violence',
  'Weapons',
  'Self Injury',
  'Physical Assault',
  'Corpses',
  'Blood',
  'Gore',
  'Dead Bodies',

  // Hate & Extremism
  'Hate Symbols',
  'Terrorist Symbols',
  'Extremist Flags',
  'Racist Gestures',

  // Drugs / Alcohol / Tobacco / Gambling
  'Drugs',
  'Drug Use',
  'Alcohol',
  'Tobacco',
  'Gambling',
  'Smoking',
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body as { imageBase64: string };
    const params = {
      Image: { Bytes: Buffer.from(imageBase64, 'base64') },
      MinConfidence: 80,
    };
    const command = new DetectModerationLabelsCommand(params);
    const response = await client.send(command);
    const moderationLabels: any[] = response.ModerationLabels || [];
    const CONFIDENCE_THRESHOLD =
      process.env.RECOGNITION_CONFIDENCE_THRESHOLD || 80;
    if (!moderationLabels || moderationLabels.length === 0) {
      return res
        .status(200)
        .json({ allowed: true, reason: 'No issues detected' });
    }

    for (const label of moderationLabels) {
      if (
        blockedCategories.includes(label.Name) &&
        label.Confidence >= CONFIDENCE_THRESHOLD
      ) {
        return res
          .status(200)
          .json({
            allowed: false,
            reason: `Blocked: ${label.Name} (${label.Confidence.toFixed(2)}%)`,
          });
      }
    }

    return res.status(200).json({ allowed: true, reason: 'Safe image' });
  } catch (error: any) {
    console.error('Rekognition Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
