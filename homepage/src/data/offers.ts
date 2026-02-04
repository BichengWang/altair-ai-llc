import { services } from "./services";

export const offers = services.map((service) => ({
  title: service.title,
  description: service.shortDescription,
  tag: service.tag,
  image: service.image,
  slug: service.slug,
}));
