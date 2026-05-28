# Avegatasta Performance Optimization Notes

This copy keeps the product data, product hierarchy, database structure, and deployment mode unchanged.

## Changes included

1. Product page filter/search/sort interactions now reset the visible result list to the first product and scroll back to the results start.
2. Product-card links explicitly request top-of-page navigation when opening a product detail page.
3. Public product images referenced by the catalog were converted to WebP where smaller. The original image files were kept for safety/fallback.
4. Navbar/footer logo now uses `/logo.webp`; `/logo.png` remains available for metadata/fallback.
5. Tawk.to chat script now loads with `lazyOnload` instead of blocking the first interactive phase.
6. Global `SessionProvider` and global page-transition wrapper were removed from the public layout. `SessionProvider` is now scoped to the admin layout only.
7. Home page below-the-fold client sections are dynamically imported to reduce the initial JavaScript needed for the first screen.
8. Static product images and WebP logo have long-lived cache headers in `next.config.ts`.
9. `compress`, `poweredByHeader: false`, and package-import optimization were added to `next.config.ts`.

## Deployment reminder

This is still a Next.js standalone project. After uploading/building, use the generated standalone `server.js` as the Node startup file.
