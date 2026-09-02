import { Schema, model } from 'mongoose';

const passengerSchema = new Schema({
    name: { type: String, default: '' },
    type: { type: String, default: 'ADT' },
    gender: { type: String, default: 'MALE' },
    passportNo: { type: String, default: '' },
    cabin: { type: String, default: '7 KG' },
    checked: { type: String, default: '1PC (23KG)' },
    eTicket: { type: String, default: '' },
}, { _id: false });

const flightSchema = new Schema({
    airline: { type: String, default: '' },
    flightNo: { type: String, default: '' },
    from: { type: String, default: '' },
    fromAirport: { type: String, default: '' },
    to: { type: String, default: '' },
    toAirport: { type: String, default: '' },
    departDay: { type: String, default: '' },
    departDate: { type: String, default: '' },
    departTime: { type: String, default: '' },
    arriveDay: { type: String, default: '' },
    arriveDate: { type: String, default: '' },
    arriveTime: { type: String, default: '' },
    classInfo: { type: String, default: 'Economy (T)' },
    refund: { type: String, default: 'Non-Refundable' },
    route: { type: String, default: 'One-way' },
    duration: { type: String, default: '' },
    personalItem: { type: String, default: 'Laptop Bag' },
    selfTransfer: { type: String, default: 'No' },
    terminalChange: { type: String, default: 'No' },
    codeshare: { type: String, default: 'No' },
    ssrRemarks: { type: String, default: 'No' },
    transitInfo: { type: String, default: '' },
}, { _id: false });

const fareSchema = new Schema({
    type: { type: String, default: 'ADT' },
    baseFare: { type: String, default: '' },
    tax: { type: String, default: '' },
    ait: { type: String, default: '' },
    grossFare: { type: String, default: '' },
    pax: { type: String, default: '1' },
    total: { type: String, default: '' },
}, { _id: false });

const ticketSchema = new Schema(
    {
        bookingRef: { type: String, default: '' },
        airlinePnr: { type: String, default: '' },
        dateOfIssue: { type: String, default: '' },
        status: { type: String, default: 'Confirmed' },
        passengers: [passengerSchema],
        flights: [flightSchema],
        fares: [fareSchema],
        grandTotal: { type: String, default: '' },
        agencyName: { type: String, default: 'Visalink Air Consultancy & Migration' },
        agencyPhone: { type: String, default: '+880 1738-886644' },
        agencyEmail: { type: String, default: 'info@visalinkair.com' },
        agencyWebsite: { type: String, default: 'www.visalinkair.com' },
        agencyOffice: { type: String, default: 'Dhaka, Bangladesh' },
        // যে ফাইলটা স্ক্যান করে এই টিকিট বানানো হয়েছে (relative /uploads/... path)।
        sourceFile: { type: String, default: '' },
    },
    { timestamps: true, versionKey: false }
);

ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ bookingRef: 1 });

export const Ticket = model('Ticket', ticketSchema);
