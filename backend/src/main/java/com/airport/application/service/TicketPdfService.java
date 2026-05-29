package com.airport.application.service;

import com.airport.domain.entity.Flight;
import com.airport.domain.entity.Reservation;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class TicketPdfService {
    private static final DeviceRgb INK = new DeviceRgb(20, 24, 31);
    private static final DeviceRgb BRAND = new DeviceRgb(0, 137, 164);
    private static final DeviceRgb BRAND_DARK = new DeviceRgb(0, 87, 110);
    private static final DeviceRgb SOFT = new DeviceRgb(231, 248, 251);
    private static final DeviceRgb LINE = new DeviceRgb(214, 225, 234);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd MMM yyyy", new Locale("es", "GT"));
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");

    public byte[] render(Reservation reservation) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfDocument pdf = new PdfDocument(new PdfWriter(out));
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(34, 34, 34, 34);

            Flight flight = reservation.getFlight();
            addHeader(doc, reservation, flight);
            addRoute(doc, flight);
            addTraveler(doc, reservation, flight);
            addFooter(doc, reservation);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("No fue posible generar el PDF del ticket", e);
        }
    }

    private void addHeader(Document doc, Reservation reservation, Flight flight) {
        Table header = new Table(UnitValue.createPercentArray(new float[]{2.1f, 1f})).useAllAvailableWidth();
        header.addCell(new Cell()
                .setBorder(Border.NO_BORDER)
                .setBackgroundColor(BRAND)
                .setPadding(22)
                .add(new Paragraph("AeroNova")
                        .setBold()
                        .setFontSize(30)
                        .setFontColor(ColorConstants.WHITE))
                .add(new Paragraph("Boarding pass digital")
                        .setFontSize(12)
                        .setFontColor(ColorConstants.WHITE)));
        header.addCell(new Cell()
                .setBorder(Border.NO_BORDER)
                .setBackgroundColor(BRAND_DARK)
                .setPadding(22)
                .setTextAlignment(TextAlignment.RIGHT)
                .add(new Paragraph("RESERVA")
                        .setFontSize(9)
                        .setFontColor(ColorConstants.WHITE))
                .add(new Paragraph(reservation.getCode())
                        .setBold()
                        .setFontSize(22)
                        .setFontColor(ColorConstants.WHITE))
                .add(new Paragraph(flight.getFlightNumber())
                        .setFontSize(12)
                        .setFontColor(ColorConstants.WHITE)));
        doc.add(header);
    }

    private void addRoute(Document doc, Flight flight) {
        Table route = new Table(UnitValue.createPercentArray(new float[]{1.4f, .35f, 1.4f})).useAllAvailableWidth();
        route.setMarginTop(18);
        route.addCell(routeCell(flight.getOrigin().getIataCode(), flight.getOrigin().getCity(), flight.getOrigin().getName()));
        route.addCell(new Cell()
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .setTextAlignment(TextAlignment.CENTER)
                .add(new Paragraph("->").setBold().setFontSize(24).setFontColor(BRAND)));
        route.addCell(routeCell(flight.getDestination().getIataCode(), flight.getDestination().getCity(), flight.getDestination().getName()));
        doc.add(route);
    }

    private void addTraveler(Document doc, Reservation reservation, Flight flight) throws Exception {
        Table body = new Table(UnitValue.createPercentArray(new float[]{1.6f, 1f})).useAllAvailableWidth();
        body.setMarginTop(18);

        Table details = new Table(UnitValue.createPercentArray(new float[]{1f, 1f})).useAllAvailableWidth();
        details.addCell(detail("Pasajero", reservation.getUser().getFullName(), 2));
        details.addCell(detail("Fecha", flight.getDepartureTime().format(DATE), 1));
        details.addCell(detail("Salida", flight.getDepartureTime().format(TIME), 1));
        details.addCell(detail("Llegada", flight.getArrivalTime().format(TIME), 1));
        details.addCell(detail("Asiento", reservation.getSeat().getSeatNumber(), 1));
        details.addCell(detail("Puerta", "B12", 1));
        details.addCell(detail("Grupo", "2", 1));
        details.addCell(detail("Estado", "CONFIRMADO", 2));

        body.addCell(new Cell().setBorder(Border.NO_BORDER).setPadding(0).add(details));

        Image qr = new Image(ImageDataFactory.create(qr(reservation.getCode())))
                .setWidth(142)
                .setHorizontalAlignment(HorizontalAlignment.CENTER);
        body.addCell(new Cell()
                .setBorder(Border.NO_BORDER)
                .setBackgroundColor(SOFT)
                .setPadding(18)
                .setTextAlignment(TextAlignment.CENTER)
                .add(new Paragraph("Codigo de embarque").setBold().setFontSize(11).setFontColor(INK))
                .add(qr)
                .add(new Paragraph(reservation.getCode()).setBold().setFontSize(16).setFontColor(BRAND_DARK))
                .add(new Paragraph("Escanee este codigo en el mostrador o puerta de abordaje.")
                        .setFontSize(9)
                        .setFontColor(new DeviceRgb(84, 99, 116))));

        doc.add(body);
    }

    private void addFooter(Document doc, Reservation reservation) {
        SolidLine separator = new SolidLine(1);
        separator.setColor(LINE);
        doc.add(new LineSeparator(separator).setMarginTop(18));
        doc.add(new Paragraph("Este ticket confirma la compra asociada a la reserva " + reservation.getCode()
                + ". Presente documento de identidad vigente. Llegue al aeropuerto con al menos 2 horas de anticipacion.")
                .setFontSize(9)
                .setFontColor(new DeviceRgb(79, 93, 110))
                .setMarginTop(12));
        doc.add(new Paragraph("Gracias por volar con AeroNova.")
                .setBold()
                .setFontSize(12)
                .setFontColor(BRAND_DARK)
                .setTextAlignment(TextAlignment.RIGHT)
                .setMarginTop(10));
    }

    private Cell routeCell(String code, String city, String airport) {
        return new Cell()
                .setBorder(Border.NO_BORDER)
                .setBackgroundColor(SOFT)
                .setPadding(18)
                .add(new Paragraph(code).setBold().setFontSize(40).setFontColor(BRAND_DARK))
                .add(new Paragraph(city).setBold().setFontSize(14).setFontColor(INK))
                .add(new Paragraph(airport).setFontSize(10).setFontColor(new DeviceRgb(79, 93, 110)));
    }

    private Cell detail(String label, String value, int colspan) {
        return new Cell(1, colspan)
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(new com.itextpdf.layout.borders.SolidBorder(LINE, .8f))
                .setPadding(12)
                .add(new Paragraph(label.toUpperCase(Locale.ROOT))
                        .setFontSize(8)
                        .setFontColor(new DeviceRgb(101, 116, 135)))
                .add(new Paragraph(value)
                        .setBold()
                        .setFontSize(13)
                        .setFontColor(INK));
    }

    private byte[] qr(String value) throws Exception {
        BitMatrix matrix = new QRCodeWriter().encode(value, BarcodeFormat.QR_CODE, 220, 220);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        return out.toByteArray();
    }
}
