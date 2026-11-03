// Chicago weather facts for planning, from published sources only.
// Normal highs: NWS Chicago, 1991-2020 climate normals at O'Hare (weather.gov/lot/ord_rfd_monthly_yearly_normals).
// Freeze dates: NWS Chicago median first fall freeze (Oct 19) and last spring freeze (Apr 21) at O'Hare, 1991-2020.
// Sunrise/sunset: computed with the NOAA solar position equations for downtown Chicago (accurate to a minute or two).

export const monthSlugs = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"] as const;
export const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Normal daily high (°F) at O'Hare by month, 1991-2020. */
export const normalHighF = [31.6, 35.7, 47.0, 59.0, 70.5, 80.4, 84.5, 82.5, 75.5, 62.7, 48.4, 36.6];
export const CLIMATE_SOURCE = "NWS Chicago 1991-2020 normals, O'Hare";
export const lastSpringFreeze = "April 21";
export const firstFallFreeze = "October 19";

const CHI = { lat: 41.8781, lon: -87.6298 };
const rad = (d: number) => (d * Math.PI) / 180;

/** Minutes after local midnight (UTC-based) for sunrise/sunset at a given solar zenith. */
function solar(iso: string, zenith: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const n = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5) + 1;
  const g = ((2 * Math.PI) / 365) * (n - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = Math.acos(Math.cos(rad(zenith)) / (Math.cos(rad(CHI.lat)) * Math.cos(decl)) - Math.tan(rad(CHI.lat)) * Math.tan(decl));
  const haDeg = (ha * 180) / Math.PI;
  const at = (min: number) => new Date(Date.UTC(y, m - 1, d, 0, Math.round(min)));
  return { rise: at(720 - 4 * (CHI.lon + haDeg) - eq), set: at(720 - 4 * (CHI.lon - haDeg) - eq) };
}

export const chicagoTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

/** Sunrise and sunset in Chicago local time for a YYYY-MM-DD date. */
export function sunTimes(iso: string) {
  const s = solar(iso, 90.833);
  return { sunrise: chicagoTime(s.rise), sunset: chicagoTime(s.set) };
}

/** Sunrise, sunset, the hour before sunset (golden light) and end of civil twilight (when it is fully dark enough to need lights). */
export function lightTimes(iso: string) {
  const s = solar(iso, 90.833);
  const civil = solar(iso, 96);
  const golden = new Date(s.set.getTime() - 60 * 6e4);
  const dayMin = Math.round((s.set.getTime() - s.rise.getTime()) / 6e4);
  return {
    sunrise: chicagoTime(s.rise),
    sunset: chicagoTime(s.set),
    goldenStart: chicagoTime(golden),
    dark: chicagoTime(civil.set),
    daylight: `${Math.floor(dayMin / 60)} h ${dayMin % 60} min`,
    sunsetDate: s.set,
  };
}

/** Plain-language weather notes for an event date. */
export function weatherNotes(iso: string, outdoor: boolean) {
  const mi = Number(iso.slice(5, 7)) - 1;
  const md = iso.slice(5);
  const high = normalHighF[mi];
  const notes: string[] = [];
  const frostRisk = md <= "04-21" || md >= "10-19";
  if (outdoor && high < 55) notes.push("Normal highs are below 55°F, so plan an indoor space or a tent with sidewalls and heaters.");
  else if (outdoor && frostRisk) notes.push("Your date falls in Chicago's frost season. Evenings can drop near freezing, so price heaters and sidewalls.");
  if (outdoor && high >= 80) notes.push("It's one of Chicago's hottest months. Plan shade for an outdoor ceremony and keep water out for guests.");
  if (outdoor && mi >= 3 && mi <= 8) notes.push("Pop-up thunderstorms are common in Chicago's warm months. A tent or indoor backup is your rain plan.");
  if (!outdoor && (mi <= 1 || mi === 11)) notes.push("Snow can move delivery windows. Ask for floor protection at the entrance and a coat rack.");
  return { month: monthNames[mi], slug: monthSlugs[mi], high, notes };
}
