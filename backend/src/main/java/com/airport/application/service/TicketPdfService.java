package com.airport.application.service;

import com.airport.domain.entity.Flight;
import com.airport.domain.entity.Reservation;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.DeviceGray;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Tab;
import com.itextpdf.layout.element.TabStop;
import com.itextpdf.layout.properties.TabAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class TicketPdfService {
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("dd MMM yyyy - HHmm", new Locale("es", "GT"));
    private static final DateTimeFormatter DATE_ONLY = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_ONLY = DateTimeFormatter.ofPattern("HH:mm");

    public byte[] render(Reservation reservation) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfDocument pdf = new PdfDocument(new PdfWriter(out));
            Document doc = new Document(pdf, new PageSize(265, 660));
            PdfFont mono = PdfFontFactory.createFont(StandardFonts.COURIER);
            PdfFont monoBold = PdfFontFactory.createFont(StandardFonts.COURIER_BOLD);
            doc.setMargins(18, 16, 18, 16);
            doc.setFont(mono);

            Flight flight = reservation.getFlight();
            LocalDateTime boardingTime = flight.getDepartureTime().minusMinutes(45);
            String gate = international(flight) ? "INTERNACIONAL 07" : "NACIONALES 02";

            doc.add(new Paragraph("AeroNova")
                    .setFont(monoBold)
                    .setFontSize(24)
                    .setMarginBottom(0));
            doc.add(new Paragraph("DIGITAL BOARDING PASS / RECIBO")
                    .setFont(monoBold)
                    .setFontSize(8)
                    .setMarginTop(0)
                    .setMarginBottom(8));
            doc.add(rule());

            doc.add(line("Passenger:", safe(reservation.getUser().getFullName()).toUpperCase(Locale.ROOT)));
            doc.add(line("Ticket Nb:", ticketNumber(reservation)));
            doc.add(line("ID Card Number:", safe(reservation.getUser().getDocumentNumber())));
            doc.add(line("Reserv Number:", reservation.getCode()));
            doc.add(line("Flight Number:", flight.getFlightNumber()));
            doc.add(line("Class:", "Y"));
            doc.add(space(4));

            doc.add(new Paragraph("Departure:")
                    .setFont(monoBold)
                    .setFontSize(10)
                    .setMargin(0));
            doc.add(new Paragraph(flight.getOrigin().getCity() + " / " + flight.getOrigin().getIataCode())
                    .setFontSize(10)
                    .setMargin(0));
            doc.add(new Paragraph(flight.getDepartureTime().format(DATE_TIME).toUpperCase(Locale.ROOT))
                    .setFont(monoBold)
                    .setFontSize(10)
                    .setMarginTop(0));

            doc.add(new Paragraph("Arrival:")
                    .setFont(monoBold)
                    .setFontSize(10)
                    .setMargin(0));
            doc.add(new Paragraph(flight.getDestination().getCity() + " - " + flight.getDestination().getIataCode() + " / " + flight.getDestination().getIataCode())
                    .setFontSize(10)
                    .setMargin(0));
            doc.add(new Paragraph(flight.getArrivalTime().format(DATE_TIME).toUpperCase(Locale.ROOT))
                    .setFont(monoBold)
                    .setFontSize(10)
                    .setMarginTop(0));

            doc.add(line("Boarding Time:", boardingTime.format(TIME_ONLY)));
            doc.add(line("Boarding Gate:", gate));
            doc.add(line("Seat:", reservation.getSeat().getSeatNumber()));
            doc.add(line("Nb of bags:", "0"));
            doc.add(line("Bag. Weight:", "0"));
            doc.add(line("Issuance Date:", LocalDateTime.now().format(DATE_ONLY)));
            doc.add(line("Validity:", flight.getDepartureTime().format(DATE_ONLY)));
            doc.add(line("Check-in time:", boardingTime.minusMinutes(15).format(TIME_ONLY)));
            doc.add(line("Status:", reservation.getStatus().name()));
            doc.add(line("Signature:", "________________"));

            doc.add(space(10));
            doc.add(rule());
            doc.add(new Paragraph("Operado por " + flight.getAirplane().getAirline() + " - " + flight.getAirplane().getModel())
                    .setFontSize(7.5f)
                    .setFontColor(new DeviceGray(.35f))
                    .setMarginTop(8)
                    .setTextAlignment(TextAlignment.CENTER));
            doc.add(new Image(ImageDataFactory.create(qr(reservation.getCode())))
                    .setWidth(165)
                    .setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER)
                    .setMarginTop(10));
            doc.add(new Paragraph(reservation.getCode())
                    .setFont(monoBold)
                    .setFontSize(13)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(5));

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("No fue posible generar el PDF del ticket", e);
        }
    }

    private Paragraph line(String label, String value) {
        Paragraph paragraph = new Paragraph()
                .setFontSize(9.4f)
                .setMargin(0)
                .setMultipliedLeading(1.05f);
        paragraph.add(label);
        paragraph.add(new Tab());
        paragraph.add(value == null || value.isBlank() ? "-" : value);
        paragraph.addTabStops(new TabStop(112, TabAlignment.LEFT));
        return paragraph;
    }

    private Paragraph space(float height) {
        return new Paragraph(" ").setFontSize(height).setMargin(0);
    }

    private LineSeparator rule() {
        SolidLine line = new SolidLine(.7f);
        line.setColor(new DeviceGray(.65f));
        LineSeparator separator = new LineSeparator(line);
        separator.setMarginBottom(8);
        return separator;
    }

    private boolean international(Flight flight) {
        return !flight.getOrigin().getCountry().equalsIgnoreCase(flight.getDestination().getCountry());
    }

    private String ticketNumber(Reservation reservation) {
        long numeric = 9_112_000_000_000L + reservation.getId();
        return Long.toString(numeric);
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private byte[] qr(String value) throws Exception {
        BitMatrix matrix = new QRCodeWriter().encode(value, BarcodeFormat.QR_CODE, 190, 190);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        return out.toByteArray();
    }
}
