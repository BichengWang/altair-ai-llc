export type Step = {
  title: string;
  description: string;
};

export type Quote = {
  quote: string;
  name: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const steps: ReadonlyArray<Step> = [
  {
    title: "Tell us what you need",
    description: "Share your postcode and a short request in minutes.",
  },
  {
    title: "We verify and match",
    description: "Altair checks availability and connects you to vetted providers.",
  },
  {
    title: "Get updates fast",
    description: "Receive clear status updates and next steps without chasing.",
  },
];

export const quotes: ReadonlyArray<Quote> = [
  {
    quote:
      "“Altair found a licensed attorney for me in under a day. The updates werclear and reassuring.”",
    name: "Redwood City client, Susan",
  },
  {
    quote:
      "“I submitted one enquiry and got matched with a local provider fast—no back-and-forth.”",
    name: "Palo Alto client, Miguel",
  },
];

export const faqs: ReadonlyArray<FaqItem> = [
  {
    question: "How much does it cost?",
    answer:
      "Altair is free to start. You only pay the provider for services you choose.",
  },
  {
    question: "Is my information private?",
    answer:
      "Yes. We collect only what is needed to match you and keep it protected.",
  },
  {
    question: "How fast will I hear back?",
    answer:
      "Most requests receive a response within 24 hours during business days.",
  },
];
