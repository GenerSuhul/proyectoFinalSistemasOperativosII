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
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.DashedBorder;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
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
    private static final DeviceRgb INK = new DeviceRgb(24, 26, 32);
    private static final DeviceRgb MUTED = new DeviceRgb(96, 105, 116);
    private static final DeviceRgb PAPER = new DeviceRgb(248, 246, 238);
    private static final DeviceRgb PANEL = new DeviceRgb(255, 253, 247);
    private static final DeviceRgb BRAND = new DeviceRgb(137, 112, 164);
    private static final DeviceRgb BRAND_DARK = new DeviceRgb(88, 64, 123);
    private static final DeviceRgb RULE = new DeviceRgb(198, 191, 181);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd MMM yyyy", new Locale("es", "GT"));
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");

    public byte[] render(Reservation reservation) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfDocument pdf = new PdfDocument(new PdfWriter(out));
            Document doc = new Document(pdf, new PageSize(820, 285));
            doc.setMargins(0, 0, 0, 0);

            Flight flight = reservation.getFlight();
            Table ticket = new Table(UnitValue.createPercentArray(new float[]{0.55f, 4.55f, 1.75f}));
            ticket.useAllAvailableWidth();
            ticket.setHeight(285);
            ticket.addCell(brandStrip());
            ticket.addCell(mainPanel(reservation, flight));
            ticket.addCell(stubPanel(reservation, flight));
            doc.add(ticket);
            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("No fue posible generar el PDF del ticket", e);
        }
    }

    private Cell brandStrip() {
        return new Cell()
                .setBorder(Border.NO_BORDER)
                .setBackgroundColor(BRAND)
                .setPadding(10)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .setTextAlignment(TextAlignment.CENTER)
                .add(new Paragraph("AERONOVA")
                        .setBold()
                        .setFontSize(11)
                        .setFontColor(ColorConstants.WHITE))
                .add(new Paragraph("BOARDING PASS")
                        .setFontSize(7)
                        .setFontColor(ColorConstants.WHITE));
    }

    private Cell mainPanel(Reservation reservation, Flight flight) throws Exception {
        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setBackgroundColor(PAPER)
                .setPadding(18);

        Table top = new Table(UnitValue.createPercentArray(new float[]{1.2f, .9f, .7f, .7f, .9f}));
        top.useAllAvailableWidth();
        top.addCell(info("Pase de abordar", flight.getFlightNumber(), 1, 18));
        top.addCell(info("Fecha", flight.getDepartureTime().format(DATE).toUpperCase(Locale.ROOT), 1, 12));
        top.addCell(info("Puerta", "B12", 1, 16));
        top.addCell(info("Grupo", "2", 1, 16));
        top.addCell(info("Asiento", reservation.getSeat().getSeatNumber(), 1, 22));
        cell.add(top);

        cell.add(new Paragraph("Nombre / Name")
                .setMarginTop(10)
                .setMarginBottom(0)
                .setFontSize(7)
                .setFontColor(MUTED)
                .setTextAlignment(TextAlignment.LEFT));
        cell.add(new Paragraph(reservation.getUser().getFullName().toUpperCase(Locale.ROOT))
                .setMarginTop(0)
                .setBold()
                .setFontSize(15)
                .setFontColor(INK));

        Table route = new Table(UnitValue.createPercentArray(new float[]{1.1f, .35f, 1.1f, .85f}));
        route.useAllAvailableWidth();
        route.setMarginTop(5);
        route.addCell(routeBlock("Origen", flight.getOrigin().getIataCode(), flight.getOrigin().getCity()));
        route.addCell(new Cell()
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .setTextAlignment(TextAlignment.CENTER)
                .add(new Paragraph("->").setBold().setFontSize(18).setFontColor(BRAND_DARK)));
        route.addCell(routeBlock("Destino", flight.getDestination().getIataCode(), flight.getDestination().getCity()));
        route.addCell(new Cell()
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .setTextAlignment(TextAlignment.CENTER)
                .add(new Image(ImageDataFactory.create(qr(reservation.getCode()))).setWidth(72).setHorizontalAlignment(HorizontalAlignment.CENTER)));
        cell.add(route);

        Table schedule = new Table(UnitValue.createPercentArray(new float[]{1f, 1f, 1f, 1f}));
        schedule.useAllAvailableWidth();
        schedule.setMarginTop(6);
        schedule.addCell(detail("Salida", flight.getDepartureTime().format(TIME)));
        schedule.addCell(detail("Llegada", flight.getArrivalTime().format(TIME)));
        schedule.addCell(detail("Reserva", reservation.getCode()));
        schedule.addCell(detail("Cabina", "Y"));
        cell.add(schedule);

        cell.add(new Paragraph("Operado por " + flight.getAirplane().getAirline() + " / " + flight.getAirplane().getModel())
                .setBackgroundColor(PANEL)
                .setBorder(new SolidBorder(new DeviceRgb(232, 226, 217), .8f))
                .setFontSize(9)
                .setFontColor(MUTED)
                .setPadding(6)
                .setMarginTop(9)
                .setTextAlignment(TextAlignment.CENTER));
        return cell;
    }

    private Cell stubPanel(Reservation reservation, Flight flight) throws Exception {
        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setBorderLeft(new DashedBorder(RULE, 1.2f))
                .setBackgroundColor(PANEL)
                .setPadding(15)
                .setTextAlignment(TextAlignment.CENTER);

        cell.add(new Paragraph("AERONOVA")
                .setBold()
                .setFontSize(10)
                .setFontColor(BRAND_DARK));
        cell.add(new Paragraph(flight.getOrigin().getIataCode() + " / " + flight.getDestination().getIataCode())
                .setBold()
                .setFontSize(16)
                .setFontColor(INK)
                .setMarginTop(6));
        cell.add(new Paragraph(flight.getFlightNumber() + "   " + flight.getDepartureTime().format(DATE).toUpperCase(Locale.ROOT))
                .setFontSize(8)
                .setFontColor(MUTED));
        cell.add(new Image(ImageDataFactory.create(qr(reservation.getCode())))
                .setWidth(92)
                .setMarginTop(8)
                .setHorizontalAlignment(HorizontalAlignment.CENTER));

        Table mini = new Table(UnitValue.createPercentArray(new float[]{1f, 1f}));
        mini.useAllAvailableWidth();
        mini.setMarginTop(8);
        mini.addCell(detail("Asiento", reservation.getSeat().getSeatNumber()));
        mini.addCell(detail("Puerta", "B12"));
        cell.add(mini);
        cell.add(new Paragraph(reservation.getCode())
                .setBold()
                .setFontSize(13)
                .setFontColor(BRAND_DARK)
                .setMarginTop(8));
        return cell;
    }

    private Cell info(String label, String value, int colspan, int fontSize) {
        return new Cell(1, colspan)
                .setBorder(Border.NO_BORDER)
                .setPadding(2)
                .add(label(label))
                .add(new Paragraph(value).setBold().setFontSize(fontSize).setFontColor(INK).setMargin(0));
    }

    private Cell routeBlock(String label, String code, String city) {
        return new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(3)
                .add(label(label))
                .add(new Paragraph(code).setBold().setFontSize(30).setFontColor(INK).setMargin(0))
                .add(new Paragraph(city).setFontSize(9).setFontColor(MUTED).setMargin(0));
    }

    private Cell detail(String label, String value) {
        return new Cell()
                .setBorder(Border.NO_BORDER)
                .setBorderTop(new SolidBorder(RULE, .7f))
                .setPadding(5)
                .add(label(label))
                .add(new Paragraph(value).setBold().setFontSize(11).setFontColor(INK).setMargin(0));
    }

    private Paragraph label(String label) {
        return new Paragraph(label.toUpperCase(Locale.ROOT))
                .setFontSize(6.5f)
                .setFontColor(MUTED)
                .setMargin(0);
    }

    private byte[] qr(String value) throws Exception {
        BitMatrix matrix = new QRCodeWriter().encode(value, BarcodeFormat.QR_CODE, 160, 160);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        return out.toByteArray();
    }
}
