export const homePageSectionsQuery = `*[_type == "homePage"][0]{
  hero,
  featuredCategories[]->{_id, title, "slug": slug.current},
  promotions,
  newsletter
}`;

export const aboutPageQuery = `*[_type == "aboutPage"][0]{
  title,
  story,
  values,
  teamMembers[]{name, role, bio, image}
}`;
