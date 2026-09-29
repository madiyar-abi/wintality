import { NextRequest, NextResponse } from "next/server";
import { allOpportunities } from "@/config/site";

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("id");

    const filtered = targetId
      ? allOpportunities.filter((o) => o.id === targetId)
      : allOpportunities.slice(0, 20);

    const now = new Date();
    const dtStamp = formatIcsDate(now);

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wintality EdTech//Kazakhstan Opportunities Tracker//RU",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Дедлайны Wintality",
      "X-WR-TIMEZONE:Asia/Almaty",
    ];

    for (const opp of filtered) {
      // Parse deadline or calculate future date from daysLeft
      const deadlineDate = new Date(Date.now() + (opp.daysLeft || 14) * 24 * 3600 * 1000);
      const dtStart = formatIcsDate(deadlineDate);
      const dtEnd = formatIcsDate(new Date(deadlineDate.getTime() + 3600 * 1000));
      const uid = `${opp.id}-deadline@wintality.kz`;

      const summary = `[Дедлайн] ${escapeIcsText(opp.title)}`;
      const description = `Организатор: ${opp.organizer}\\nКатегория: ${opp.categoryLabel}\\nЛокация: ${opp.cityBadge}\\nПодать заявку: ${opp.link}\\n\\nСледите за дедлайнами на https://wintality.kz`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `URL:${opp.link}`,
        `LOCATION:${escapeIcsText(opp.organizer + ", " + opp.cityBadge)}`,
        "STATUS:CONFIRMED",
        // Alarm 1: 7 days before
        "BEGIN:VALARM",
        "TRIGGER:-P7D",
        "ACTION:DISPLAY",
        "DESCRIPTION:Напоминание: 7 дней до дедлайна " + summary,
        "END:VALARM",
        // Alarm 2: 3 days before
        "BEGIN:VALARM",
        "TRIGGER:-P3D",
        "ACTION:DISPLAY",
        "DESCRIPTION:Внимание: 3 дня до дедлайна " + summary,
        "END:VALARM",
        // Alarm 3: 24 hours before
        "BEGIN:VALARM",
        "TRIGGER:-P1D",
        "ACTION:DISPLAY",
        "DESCRIPTION:Срочно: 24 часа до окончания приема заявок " + summary,
        "END:VALARM",
        "END:VEVENT"
      );
    }

    icsContent.push("END:VCALENDAR");

    const body = icsContent.join("\r\n");

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="wintality-deadlines.ics"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Calendar export error:", error);
    return NextResponse.json({ error: "Failed to generate iCal calendar" }, { status: 500 });
  }
}
