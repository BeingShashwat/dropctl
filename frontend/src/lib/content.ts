/**
 * Long-form page copy.
 *
 * Kept in one place because the visible sections and the FAQPage structured
 * data must say exactly the same thing — Google treats a mismatch between
 * markup and rendered content as a problem, so they are generated from this
 * single source rather than maintained twice.
 */

export interface Step {
  title: string;
  body: string;
}

export interface Question {
  question: string;
  answer: string;
}

export const HOW_IT_WORKS: Step[] = [
  {
    title: "Drop a file",
    body: "Choose a file up to 10 MB, or drag it straight onto the page. One file per drop keeps the link clean.",
  },
  {
    title: "Set the clock",
    body: "Pick an expiry anywhere from 1 hour to 7 days, and optionally claim your own slug for a link you can read out loud.",
  },
  {
    title: "Share the link",
    body: "Copy the short link or hand over the QR code. When the time is up the file is deleted, not just unpublished.",
  },
];

export const FAQ: Question[] = [
  {
    question: "How long can a drop stay online?",
    answer:
      "Anywhere from 1 hour to 7 days, chosen when you upload. The default is 24 hours.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. There is no sign-up, no email and no dashboard to manage. Upload the file and the link is the only thing you have to keep.",
  },
  {
    question: "What happens when a drop expires?",
    answer:
      "The stored file is deleted from storage and the record is removed, then the link reports that the drop has expired. Nothing is recoverable afterwards.",
  },
  {
    question: "Is there a limit on file size?",
    answer:
      "10 MB per drop, with a limit of one file per drop. Supported files include images, PDFs, plain text, CSV and Office documents.",
  },
  {
    question: "Are drops private?",
    answer:
      "Treat a drop link as unlisted rather than secret. Anyone holding the link can download the file, and slugs are short enough to be guessable, so use a custom slug if you want something memorable rather than stronger. Files are encrypted at rest with AES-256 and served over HTTPS, but this is not end-to-end encryption — do not use dropctl for anything that must stay confidential.",
  },
];
