package com.airport.application.service;

import com.airport.domain.entity.Reservation;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TicketEmailService {
    private static final Logger log = LoggerFactory.getLogger(TicketEmailService.class);
    private static final URI RESEND_EMAILS_URI = URI.create("https://api.resend.com/emails");

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${app.mail.enabled:true}")
    private boolean enabled;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.resend.api-key:}")
    private String apiKey;

    public EmailResult sendTicket(Reservation reservation, byte[] pdf) {
        if (!enabled || apiKey == null || apiKey.isBlank() || apiKey.startsWith("replace-")) {
            log.warn("Envio de ticket omitido: RESEND_API_KEY no esta configurado");
            return new EmailResult(false, "RESEND_API_KEY no esta configurado en el Secret de Kubernetes.");
        }

        try {
            String filename = "ticket-" + reservation.getCode() + ".pdf";
            Map<String, Object> payload = Map.of(
                    "from", from,
                    "to", List.of(reservation.getUser().getEmail()),
                    "subject", "Tu ticket de vuelo " + reservation.getFlight().getFlightNumber(),
                    "html", html(reservation),
                    "attachments", List.of(Map.of(
                            "filename", filename,
                            "content", Base64.getEncoder().encodeToString(pdf)
                    ))
            );

            HttpRequest request = HttpRequest.newBuilder(RESEND_EMAILS_URI)
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.error("Resend rechazo el envio del ticket {} con status {}: {}",
                        reservation.getCode(), response.statusCode(), response.body());
                return new EmailResult(false, "Resend rechazo el correo con status " + response.statusCode() + ".");
            }

            log.info("Ticket {} enviado a {}", reservation.getCode(), reservation.getUser().getEmail());
            return new EmailResult(true, "Ticket enviado al correo registrado.");
        } catch (Exception e) {
            log.error("No fue posible enviar el ticket {} por correo", reservation.getCode(), e);
            return new EmailResult(false, "No fue posible conectar con Resend. Revisar logs del backend.");
        }
    }

    public record EmailResult(boolean sent, String message) {}

    private String html(Reservation reservation) {
        var flight = reservation.getFlight();
        return """
                <div style="font-family:Inter,Arial,sans-serif;background:#f4f8fb;padding:28px;color:#14181f">
                  <div style="max-width:640px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #dbe7ef">
                    <div style="background:#0089a4;color:white;padding:26px 30px">
                      <h1 style="margin:0;font-size:28px">Tu viaje esta confirmado</h1>
                      <p style="margin:8px 0 0">Adjuntamos tu boarding pass en PDF.</p>
                    </div>
                    <div style="padding:28px 30px">
                      <p>Hola <strong>%s</strong>,</p>
                      <p>Tu reserva <strong>%s</strong> para el vuelo <strong>%s</strong> fue confirmada correctamente.</p>
                      <table style="width:100%%;border-collapse:collapse;margin:18px 0">
                        <tr><td style="padding:10px;border-bottom:1px solid #edf2f6">Ruta</td><td style="padding:10px;border-bottom:1px solid #edf2f6"><strong>%s -> %s</strong></td></tr>
                        <tr><td style="padding:10px;border-bottom:1px solid #edf2f6">Asiento</td><td style="padding:10px;border-bottom:1px solid #edf2f6"><strong>%s</strong></td></tr>
                        <tr><td style="padding:10px;border-bottom:1px solid #edf2f6">Salida</td><td style="padding:10px;border-bottom:1px solid #edf2f6"><strong>%s</strong></td></tr>
                      </table>
                      <p style="font-size:13px;color:#5f6f80">Presenta el PDF adjunto junto a tu documento de identidad.</p>
                    </div>
                  </div>
                </div>
                """.formatted(
                escape(reservation.getUser().getFullName()),
                escape(reservation.getCode()),
                escape(flight.getFlightNumber()),
                escape(flight.getOrigin().getIataCode()),
                escape(flight.getDestination().getIataCode()),
                escape(reservation.getSeat().getSeatNumber()),
                escape(flight.getDepartureTime().toString())
        );
    }

    private String escape(String value) {
        return value == null ? "" : value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
