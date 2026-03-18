import { describe, it, expect, vi } from 'vitest'
import { parseNIDText } from '@/lib/services/ocr'

// Mock tesseract.js to avoid loading WASM in tests
vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn(),
  },
}))

describe('parseNIDText', () => {
  it('extracts a 10-digit NID number', () => {
    const text = 'NID No. 600 458 9963'
    const result = parseNIDText(text)
    expect(result.nid_number).toBe('6004589963')
  })

  it('extracts NID number without spaces', () => {
    const text = 'NID No. 6004589963'
    const result = parseNIDText(text)
    expect(result.nid_number).toBe('6004589963')
  })

  it('extracts date of birth in DD Mon YYYY format (NID format)', () => {
    const text = 'Date of Birth 25 Nov 1983'
    const result = parseNIDText(text)
    expect(result.date_of_birth).toBe('1983-11-25')
  })

  it('extracts date of birth in DD/MM/YYYY format', () => {
    const text = 'DOB: 15/06/1990'
    const result = parseNIDText(text)
    expect(result.date_of_birth).toBe('1990-06-15')
  })

  it('extracts date of birth in DD-MM-YYYY format', () => {
    const text = 'Birth: 05-01-1985'
    const result = parseNIDText(text)
    expect(result.date_of_birth).toBe('1985-01-05')
  })

  it('extracts date of birth in DD.MM.YYYY format', () => {
    const text = 'DOB 3.12.2000'
    const result = parseNIDText(text)
    expect(result.date_of_birth).toBe('2000-12-03')
  })

  it('extracts English name after "Name" label', () => {
    const text = 'Name\nNOOR ALAM'
    const result = parseNIDText(text)
    expect(result.name_en).toBe('NOOR ALAM')
  })

  it('extracts father name after "পিতা" label', () => {
    const text = 'পিতা\nKALA MIA'
    const result = parseNIDText(text)
    expect(result.father_name_en).toBe('KALA MIA')
  })

  it('extracts mother name after "মাতা" label', () => {
    const text = 'মাতা\nSORU BEGUM'
    const result = parseNIDText(text)
    expect(result.mother_name_en).toBe('SORU BEGUM')
  })

  it('extracts Bangla name after "নাম" label', () => {
    const text = 'নাম নূর আলম'
    const result = parseNIDText(text)
    expect(result.name_bn).toBe('নূর আলম')
  })

  it('returns nulls for unparseable text', () => {
    const text = 'Random gibberish with no structured data'
    const result = parseNIDText(text)
    expect(result.nid_number).toBeNull()
    expect(result.name_en).toBeNull()
    expect(result.date_of_birth).toBeNull()
    expect(result.mother_name_en).toBeNull()
  })

  it('preserves raw text in output', () => {
    const text = 'Some raw OCR output\nLine 2'
    const result = parseNIDText(text)
    expect(result.raw_text).toBe(text)
  })

  it('handles full NID card text like the reference image', () => {
    const text = 'নাম নূর আলম\nName\nNOOR ALAM\nপিতা\nকালা মিয়া\nমাতা\nসরু বেগম\nDate of Birth 25 Nov 1983\nNID No. 600 458 9963'
    const result = parseNIDText(text)
    expect(result.name_en).toBe('NOOR ALAM')
    expect(result.name_bn).toBe('নূর আলম')
    expect(result.nid_number).toBe('6004589963')
    expect(result.date_of_birth).toBe('1983-11-25')
  })

  it('pads single-digit day and month in numeric date', () => {
    const text = 'DOB: 1/2/1999'
    const result = parseNIDText(text)
    expect(result.date_of_birth).toBe('1999-02-01')
  })

  it('initializes confidence to 0', () => {
    const result = parseNIDText('any text')
    expect(result.confidence).toBe(0)
  })

  it('prefers NID No. label match over bare number', () => {
    const text = 'NID No. 600 458 9963 some other 123 456 7890'
    const result = parseNIDText(text)
    expect(result.nid_number).toBe('6004589963')
  })

  it('handles various month names in date', () => {
    const months = [
      { input: '15 Jan 2000', expected: '2000-01-15' },
      { input: '1 Mar 1995', expected: '1995-03-01' },
      { input: '31 Dec 1980', expected: '1980-12-31' },
    ]
    for (const { input, expected } of months) {
      const result = parseNIDText(`Date of Birth ${input}`)
      expect(result.date_of_birth).toBe(expected)
    }
  })
})

describe('extractTextFromImage', () => {
  it('returns error when Tesseract fails', async () => {
    const Tesseract = (await import('tesseract.js')).default
    vi.mocked(Tesseract.recognize).mockRejectedValueOnce(new Error('WASM load failed'))

    const { extractTextFromImage } = await import('@/lib/services/ocr')
    const file = new File(['fake image'], 'nid.jpg', { type: 'image/jpeg' })
    const result = await extractTextFromImage(file)

    expect(result.success).toBe(false)
    expect(result.error).toBe('WASM load failed')
    expect(result.data).toBeNull()
  })

  it('returns parsed data on success', async () => {
    const Tesseract = (await import('tesseract.js')).default
    vi.mocked(Tesseract.recognize).mockResolvedValueOnce({
      data: {
        text: 'Name\nNOOR ALAM\nNID No. 600 458 9963\nDate of Birth 25 Nov 1983',
        confidence: 85,
      },
    } as never)

    const { extractTextFromImage } = await import('@/lib/services/ocr')
    const file = new File(['fake image'], 'nid.jpg', { type: 'image/jpeg' })
    const result = await extractTextFromImage(file)

    expect(result.success).toBe(true)
    expect(result.data?.name_en).toBe('NOOR ALAM')
    expect(result.data?.nid_number).toBe('6004589963')
    expect(result.data?.date_of_birth).toBe('1983-11-25')
    expect(result.data?.confidence).toBe(85)
  })
})

describe('extractNIDData', () => {
  it('merges front and back data', async () => {
    const Tesseract = (await import('tesseract.js')).default
    vi.mocked(Tesseract.recognize)
      .mockResolvedValueOnce({
        data: { text: 'Name\nNOOR ALAM\nNID No. 600 458 9963', confidence: 90 },
      } as never)
      .mockResolvedValueOnce({
        data: { text: 'Mother SORU BEGUM\nDate of Birth 25 Nov 1983', confidence: 80 },
      } as never)

    const { extractNIDData } = await import('@/lib/services/ocr')
    const front = new File(['front'], 'front.jpg', { type: 'image/jpeg' })
    const back = new File(['back'], 'back.jpg', { type: 'image/jpeg' })

    const result = await extractNIDData(front, back)

    expect(result.merged).not.toBeNull()
    expect(result.merged?.name_en).toBe('NOOR ALAM')
    expect(result.merged?.mother_name_en).toBe('SORU BEGUM')
    expect(result.merged?.nid_number).toBe('6004589963')
    expect(result.merged?.date_of_birth).toBe('1983-11-25')
    expect(result.merged?.confidence).toBe(90) // Max of front/back
  })
})
