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

export type Metric = {
  label: string;
  value: string;
};

export type ValueProp = {
  title: string;
  description: string;
};

export const steps: ReadonlyArray<Step> = [
  {
    title: "Tell us what you need",
    description: "Share your location, timeline, and the service you want.",
  },
  {
    title: "We verify and match",
    description:
      "Altair checks availability, compliance fit, and the right provider.",
  },
  {
    title: "Get updates fast",
    description: "Receive clear updates and next steps within 24 hours.",
  },
];

export const quotes: ReadonlyArray<Quote> = [
  {
    quote:
      "Altair connected me with a licensed attorney the same day and kept me updated.",
    name: "Redwood City client, Susan",
  },
  {
    quote:
      "I submitted one enquiry and was matched with a local provider fast, no back and forth.",
    name: "Palo Alto client, Miguel",
  },
  {
    quote:
      "The intake was simple and the handoff felt smooth. I knew what to expect.",
    name: "San Mateo client, Priya",
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
  {
    question: "Which areas do you serve?",
    answer:
      "We focus on the San Francisco Bay Area and expand based on demand.",
  },
];

export const metrics: ReadonlyArray<Metric> = [
  { label: "Average response", value: "4-12 hrs" },
  { label: "Verified providers", value: "140+" },
  { label: "Client satisfaction", value: "4.9/5" },
];

export const valueProps: ReadonlyArray<ValueProp> = [
  {
    title: "Compliance-first intake",
    description:
      "We collect only what is needed and keep records secure and audit-ready.",
  },
  {
    title: "Local provider network",
    description:
      "We vet providers for licensing, responsiveness, and service quality.",
  },
  {
    title: "Clear communication",
    description:
      "Every request includes status updates, timelines, and next steps.",
  },
];

export const coverageAreas = [
  "San Francisco",
  "Oakland",
  "San Jose",
  "Berkeley",
  "Palo Alto",
  "San Mateo",
];
