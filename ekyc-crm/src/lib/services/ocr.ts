/**
 * OCR Service for NID Data Extraction
 *
 * Uses Tesseract.js to extract text from NID card images in both
 * Bangla and English. Parses extracted text to populate customer
 * information fields automatically.
 */

import Tesseract from 'tesseract.js'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OCRExtractedData {
  nid_number: string | null
  name_en: string | null
  name_bn: string | null
  father_name_en: string | null
  mother_name_en: string | null
  date_of_birth: string | null
  raw_text: string
  confidence: number
}

export interface OCRResult {
  success: boolean
  data: OCRExtractedData | null
  error: string | null
}

// ─── NID field patterns ──────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04',
  may: '05', jun: '06', jul: '07', aug: '08',
  sep: '09', oct: '10', nov: '11', dec: '12',
}

const PATTERNS = {
  // 10-digit NID number (may appear with spaces like "600 458 9963")
  nidNumber: /\b(\d{3}\s?\d{3}\s?\d{4})\b/,
  // Date patterns: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  dateNumeric: /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\b/,
  // Date pattern: DD Mon YYYY (e.g. "25 Nov 1983") — matches actual NID format
  dateTextMonth: /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/i,
  // "Name:" followed by English text (stops before known labels like NID, Date, DOB)
  nameEn: /(?:Name|নাম)\s*[:：]?\s*([A-Z][A-Za-z.]+(?:\s(?!NID|Date|DOB|No\.)[A-Z][A-Za-z.]+)*)/,
  // Bangla name (Unicode block \u0980-\u09FF)
  nameBn: /(?:নাম)\s*[:：]?\s*([\u0980-\u09FF]+(?:\s[\u0980-\u09FF]+)*)/,
  // Father's name (পিতা on NID)
  fatherNameEn: /(?:Father|পিতা)\s*[:：]?\s*([A-Za-z.]+(?:\s(?!NID|Date|DOB|No\.|মাতা|মাতার)[A-Za-z.]+)*)/i,
  // Mother's name (মাতা on NID)
  motherNameEn: /(?:Mother|মাতা)\s*[:：]?\s*([A-Za-z.]+(?:\s(?!NID|Date|DOB|No\.|পিতা)[A-Za-z.]+)*)/i,
  // NID No. label pattern
  nidLabel: /NID\s*No\.?\s*[:：]?\s*(\d{3}\s?\d{3}\s?\d{4})/i,
}

// ─── Parse extracted text ────────────────────────────────────────────────────

export function parseNIDText(text: string): OCRExtractedData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const fullText = lines.join(' ')

  let nid_number: string | null = null
  let name_en: string | null = null
  let name_bn: string | null = null
  let father_name_en: string | null = null
  let mother_name_en: string | null = null
  let date_of_birth: string | null = null

  // Extract NID number — try "NID No." label first, then general 10-digit pattern
  const nidLabelMatch = fullText.match(PATTERNS.nidLabel)
  if (nidLabelMatch) {
    nid_number = nidLabelMatch[1].replace(/\s/g, '')
  } else {
    const nidMatch = fullText.match(PATTERNS.nidNumber)
    if (nidMatch) {
      nid_number = nidMatch[1].replace(/\s/g, '')
    }
  }

  // Extract date of birth — try "DD Mon YYYY" first (NID format), then numeric
  const dobTextMatch = fullText.match(PATTERNS.dateTextMonth)
  if (dobTextMatch) {
    const [, day, monthStr, year] = dobTextMatch
    const month = MONTH_MAP[monthStr.toLowerCase()]
    if (month) {
      date_of_birth = `${year}-${month}-${day.padStart(2, '0')}`
    }
  }
  if (!date_of_birth) {
    const dobNumMatch = fullText.match(PATTERNS.dateNumeric)
    if (dobNumMatch) {
      const [, day, month, year] = dobNumMatch
      date_of_birth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }

  // Extract English name
  const nameEnMatch = fullText.match(PATTERNS.nameEn)
  if (nameEnMatch) {
    name_en = nameEnMatch[1].trim()
  }

  // Extract Bangla name
  const nameBnMatch = fullText.match(PATTERNS.nameBn)
  if (nameBnMatch) {
    name_bn = nameBnMatch[1].trim()
  }

  // Extract father's name (পিতা)
  const fatherMatch = fullText.match(PATTERNS.fatherNameEn)
  if (fatherMatch) {
    father_name_en = fatherMatch[1].trim()
  }

  // Extract mother's name (মাতা)
  const motherMatch = fullText.match(PATTERNS.motherNameEn)
  if (motherMatch) {
    mother_name_en = motherMatch[1].trim()
  }

  return {
    nid_number,
    name_en,
    name_bn,
    father_name_en,
    mother_name_en,
    date_of_birth,
    raw_text: text,
    confidence: 0, // Will be set by the caller
  }
}

// ─── Run OCR on image ────────────────────────────────────────────────────────

export async function extractTextFromImage(
  imageSource: File | string,
  languages: string = 'eng+ben'
): Promise<OCRResult> {
  try {
    const { data } = await Tesseract.recognize(imageSource, languages, {
      logger: () => {}, // Suppress progress logs
    })

    const parsedData = parseNIDText(data.text)
    parsedData.confidence = data.confidence

    return {
      success: true,
      data: parsedData,
      error: null,
    }
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'OCR processing failed',
    }
  }
}

// ─── Extract from NID front and back ─────────────────────────────────────────

export async function extractNIDData(
  frontImage: File,
  backImage: File
): Promise<{
  front: OCRResult
  back: OCRResult
  merged: OCRExtractedData | null
}> {
  const [front, back] = await Promise.all([
    extractTextFromImage(frontImage),
    extractTextFromImage(backImage),
  ])

  // Merge data from front and back, preferring front for conflicts
  if (front.success || back.success) {
    const frontData = front.data
    const backData = back.data

    const merged: OCRExtractedData = {
      nid_number: frontData?.nid_number || backData?.nid_number || null,
      name_en: frontData?.name_en || backData?.name_en || null,
      name_bn: frontData?.name_bn || backData?.name_bn || null,
      father_name_en: frontData?.father_name_en || backData?.father_name_en || null,
      mother_name_en: frontData?.mother_name_en || backData?.mother_name_en || null,
      date_of_birth: frontData?.date_of_birth || backData?.date_of_birth || null,
      raw_text: [frontData?.raw_text, backData?.raw_text].filter(Boolean).join('\n---\n'),
      confidence: Math.max(frontData?.confidence || 0, backData?.confidence || 0),
    }

    return { front, back, merged }
  }

  return { front, back, merged: null }
}
