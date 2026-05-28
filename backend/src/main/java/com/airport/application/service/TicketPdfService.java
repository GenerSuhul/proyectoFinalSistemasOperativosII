package com.airport.application.service;

import com.airport.domain.entity.Reservation;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class TicketPdfService {
    public byte[] render(Reservation reservation) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfDocument pdf = new PdfDocument(new PdfWriter(out));
            Document doc = new Document(pdf, new PageSize(226, 520));
            doc.setMargins(14, 14, 14, 14);
            var flight = reservation.getFlight();
            doc.add(new Paragraph("AIRPORT PLATFORM").setBold().setFontSize(14).setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("BOARDING PASS").setFontSize(10).setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("Reserva: " + reservation.getCode()).setBold());
            doc.add(new Paragraph("Pasajero: " + reservation.getUser().getFullName()));
            doc.add(new Paragraph("Vuelo: " + flight.getFlightNumber()));
            doc.add(new Paragraph("Ruta: " + flight.getOrigin().getIataCode() + " -> " + flight.getDestination().getIataCode()));
            doc.add(new Paragraph("Salida: " + flight.getDepartureTime()));
            doc.add(new Paragraph("Asiento: " + reservation.getSeat().getSeatNumber()).setBold().setFontSize(16));
            doc.add(new Image(ImageDataFactory.create(qr(reservation.getCode()))).setWidth(110).setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER));
            doc.add(new Paragraph("Presente este ticket en mostrador").setFontSize(8).setTextAlignment(TextAlignment.CENTER));
            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("No fue posible generar el PDF", e);
        }
    }

    private byte[] qr(String value) throws Exception {
        BitMatrix matrix = new QRCodeWriter().encode(value, BarcodeFormat.QR_CODE, 180, 180);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        return out.toByteArray();
    }
}
