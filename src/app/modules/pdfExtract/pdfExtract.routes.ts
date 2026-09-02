// ===================================================================
// Visalink Air - PDF Extract Route (Groq AI powered)
// Flight ticket document theke 44 fields extract kore frontend format e
// ===================================================================

import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Groq from 'groq-sdk';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (_req: any, file: any, cb: any) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and image files allowed'));
        }
    },
});

// Ticket-specific prompt that returns EXACTLY the frontend format
const TICKET_PROMPT = `You are an expert airline e-ticket data extractor. 
Extract ALL visible information from this flight ticket/itinerary document.

Return ONLY a valid JSON object in this EXACT structure. Use "" for missing fields.

{
  "bookingRef": "Booking reference number",
  "airlinePnr": "Airline PNR code",
  "dateOfIssue": "Date of issue (e.g. 19-Sep-2025)",
  "status": "Confirmed or Pending or Cancelled",
  "grandTotal": "Grand total fare amount with commas (e.g. 4,10,367)",
  "passengers": [
    {
      "name": "Full passenger name with title (e.g. MR GOLAM MONZUR AHAMED)",
      "type": "ADT or CHD or INF",
      "gender": "MALE or FEMALE",
      "passportNo": "Passport number",
      "cabin": "Cabin baggage (e.g. 7 KG)",
      "checked": "Checked baggage (e.g. 1PC (23KG))",
      "eTicket": "E-ticket number"
    }
  ],
  "flights": [
    {
      "airline": "Airline name (e.g. Emirates)",
      "flightNo": "Flight number (e.g. EK 585)",
      "from": "Departure IATA code (e.g. DAC)",
      "fromAirport": "Full departure airport name",
      "to": "Arrival IATA code (e.g. DXB)",
      "toAirport": "Full arrival airport name",
      "departDay": "Departure day (e.g. FRI)",
      "departDate": "Departure date (e.g. 29 May 2026)",
      "departTime": "Departure time (e.g. 01:40)",
      "arriveDay": "Arrival day (e.g. FRI)",
      "arriveDate": "Arrival date (e.g. 29 May 2026)",
      "arriveTime": "Arrival time (e.g. 04:30)",
      "classInfo": "Class info (e.g. Economy (T))",
      "refund": "Refund policy (e.g. Non-Refundable)",
      "route": "Route type (e.g. One-way or Round-trip)",
      "duration": "Flight duration (e.g. 4h 50m)",
      "personalItem": "Personal item allowed (e.g. Laptop Bag)",
      "selfTransfer": "Self transfer required? (No or Yes)",
      "terminalChange": "Terminal change? (No or Yes)",
      "codeshare": "Codeshare flight? (No or Yes)",
      "ssrRemarks": "SSR remarks (e.g. No)",
      "transitInfo": "Transit details if connecting (e.g. Transit in Dubai (DXB) 4h 15m)"
    }
  ],
  "fares": [
    {
      "type": "ADT or CHD or INF",
      "baseFare": "Base fare with commas (e.g. 1,23,093)",
      "tax": "Tax amount with commas",
      "ait": "AIT amount",
      "grossFare": "Gross fare with commas",
      "pax": "Number of passengers of this type",
      "total": "Total for this type with commas"
    }
  ]
}

RULES:
- Extract EVERY passenger, EVERY flight segment, and EVERY fare type separately
- For multiple flights (connecting), create separate objects in flights array
- IMPORTANT: For EACH flight segment, fill ALL fields including classInfo, refund, route, duration, personalItem, selfTransfer, terminalChange, codeshare, ssrRemarks. If the same class/refund/route applies to all segments, REPEAT the same values for every flight segment. Do NOT leave these fields empty for connecting flights.
- For multiple passenger types (ADT, CHD, INF), create separate fare objects
- Look for ALL details: baggage, class, refund policy, duration, transit info
- Return ONLY raw JSON, NO markdown, NO explanation, NO code block
- If a field is not found, use empty string ""`;


// POST /api/pdf-extract (admin only)
router.post('/', authMiddleware, authorizeRoles('super_admin'), upload.single('pdf'), async (req: any, res: any) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const isPdf = file.mimetype === 'application/pdf';
        let extractedText = '';

        if (isPdf) {
            const pdfData = await pdfParse(file.buffer);
            extractedText = pdfData.text || '';
            console.log(`📄 PDF: ${pdfData.numpages} pages, ${extractedText.length} chars`);
        }

        // Check Groq API key
        const apiKey = (process.env.GROQ_API_KEY || '').trim();
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return res.status(200).json({
                success: true,
                aiParsed: false,
                data: { text: extractedText },
            });
        }

        const groq = new Groq({ apiKey });
        let aiResult: any = {};

        if (isPdf) {
            // PDF: text-based extraction with LLaMA
            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'user',
                        content: `${TICKET_PROMPT}\n\nDocument text:\n---\n${extractedText.slice(0, 8000)}\n---`,
                    },
                ],
                temperature: 0.1,
                max_tokens: 3000,
            });

            const text = completion.choices[0]?.message?.content?.trim() || '{}';
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            aiResult = JSON.parse(start !== -1 ? text.slice(start, end + 1) : '{}');
        } else {
            // Image: vision model for scanned tickets
            const base64 = file.buffer.toString('base64');
            const dataUrl = `data:${file.mimetype};base64,${base64}`;

            const completion = await groq.chat.completions.create({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: TICKET_PROMPT },
                            { type: 'image_url', image_url: { url: dataUrl } },
                        ] as any,
                    },
                ],
                temperature: 0.1,
                max_tokens: 3000,
            });

            const text = completion.choices[0]?.message?.content?.trim() || '{}';
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            aiResult = JSON.parse(start !== -1 ? text.slice(start, end + 1) : '{}');
        }

        // Ensure arrays exist
        if (!Array.isArray(aiResult.passengers)) aiResult.passengers = [];
        if (!Array.isArray(aiResult.flights)) aiResult.flights = [];
        if (!Array.isArray(aiResult.fares)) aiResult.fares = [];

        console.log('✅ AI ticket extraction complete:');
        console.log(`   Passengers: ${aiResult.passengers.length}`);
        console.log(`   Flights: ${aiResult.flights.length}`);
        console.log(`   Fares: ${aiResult.fares.length}`);
        console.log(`   Booking: ${aiResult.bookingRef || 'N/A'}`);

        return res.status(200).json({
            success: true,
            aiParsed: true,
            data: aiResult,
        });
    } catch (error: any) {
        console.error('❌ Extract error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Extraction failed',
        });
    }
});

export const PdfExtractRoutes = router;
