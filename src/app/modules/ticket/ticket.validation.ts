// ===================================================================
// Visalink Air - Ticket Validation (Zod)
// ===================================================================

import { z } from 'zod';

const passengerSchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    gender: z.string().optional(),
    passportNo: z.string().optional(),
    cabin: z.string().optional(),
    checked: z.string().optional(),
    eTicket: z.string().optional(),
});

const flightSchema = z.object({
    airline: z.string().optional(),
    flightNo: z.string().optional(),
    from: z.string().optional(),
    fromAirport: z.string().optional(),
    to: z.string().optional(),
    toAirport: z.string().optional(),
    departDay: z.string().optional(),
    departDate: z.string().optional(),
    departTime: z.string().optional(),
    arriveDay: z.string().optional(),
    arriveDate: z.string().optional(),
    arriveTime: z.string().optional(),
    classInfo: z.string().optional(),
    refund: z.string().optional(),
    route: z.string().optional(),
    duration: z.string().optional(),
    personalItem: z.string().optional(),
    selfTransfer: z.string().optional(),
    terminalChange: z.string().optional(),
    codeshare: z.string().optional(),
    ssrRemarks: z.string().optional(),
    transitInfo: z.string().optional(),
});

const fareSchema = z.object({
    type: z.string().optional(),
    baseFare: z.string().optional(),
    tax: z.string().optional(),
    ait: z.string().optional(),
    grossFare: z.string().optional(),
    pax: z.string().optional(),
    total: z.string().optional(),
});

const ticketBodySchema = z.object({
    bookingRef: z.string().optional(),
    airlinePnr: z.string().optional(),
    dateOfIssue: z.string().optional(),
    status: z.string().optional(),
    passengers: z.array(passengerSchema).optional(),
    flights: z.array(flightSchema).optional(),
    fares: z.array(fareSchema).optional(),
    grandTotal: z.string().optional(),
    agencyName: z.string().optional(),
    agencyPhone: z.string().optional(),
    agencyEmail: z.string().optional(),
    agencyWebsite: z.string().optional(),
    agencyOffice: z.string().optional(),
    // যে স্ক্যান/PDF থেকে টিকিটের তথ্য তোলা হয়েছে তার relative path
    sourceFile: z.string().optional(),
});

const createTicketSchema = z.object({
    body: ticketBodySchema,
});

const updateTicketSchema = z.object({
    body: ticketBodySchema,
});

export const TicketValidation = {
    createTicketSchema,
    updateTicketSchema,
};
