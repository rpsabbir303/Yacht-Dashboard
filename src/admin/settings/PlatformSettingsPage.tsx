/**
 * Platform Settings — hosts the platform-level legal documents manager.
 *
 * This is a yacht hiring platform: the only platform-wide configuration the
 * admin actually authors today is the legal documentation that ships in the
 * crew / owner apps. System / server / SMTP / 2FA-policy panels are out of
 * scope and were intentionally removed.
 */

import { LegalSettings } from "./LegalSettings";

export const PlatformSettingsPage = () => <LegalSettings />;

export default PlatformSettingsPage;
