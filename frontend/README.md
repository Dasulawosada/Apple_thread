# Apple Thread — University Project (Full Functionality)

React + Vite frontend for the Apple Thread thread-selling e-commerce site.
This version is fully wired up: the admin panel can add/edit/delete products
with photo uploads, and those products immediately appear on the Home page
and Products page for customers to click through, add to cart, and check out.

## Setup

```
npm install
npm run dev
```

Then open http://localhost:5173

## How data is stored

There is no backend/database in this version — everything is saved in the
browser's `localStorage`, which is perfect for a university demo (no server
to set up) but means:
- Data is per-browser. Opening the site in a different browser or clearing
  site data will reset it back to the starter products.
- Product photos uploaded in the Admin panel are converted to base64 and
  saved directly in `localStorage` together with the product.

Storage keys used: `apple-thread-products`, `apple-thread-cart`,
`apple-thread-orders`, `apple-thread-user`, `apple-thread-admin`.

## Admin panel

Go to `/admin` (there's a 🔒 Admin link in the site's navigation bar).

```
Username: admin
Password: admin123
```

From the dashboard sidebar you can:
- **Products** — see every product, edit it, or delete it
- **Add Product** — upload a photo (click the dashed box), set name,
  category, description, price, old price and stock. Saving sends you
  straight back to the product list, and the product is now live on the
  customer site.

## Customer flow that now actually works

Home → Products (filters + sort) → Product Details (quantity selector) →
Add to Cart / Buy Now → Cart (change quantity, remove items) → Checkout
(address form) → Place Order → Order Confirmation → Profile (order history).

## Setting up real Google Sign-In

The Login page (`/login`) is wired for **Sign in with Google**, but it needs
your own Google Cloud OAuth Client ID — this is something only you can create
(it's tied to your Google account and the exact URL your site runs on):

1. Go to https://console.cloud.google.com/ and create a project (or use an
   existing one).
2. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local development)
   - your real domain later, once you deploy the site
5. Copy the generated **Client ID** (it ends with `.apps.googleusercontent.com`).
6. Open `src/pages/Login.jsx` and paste it into the `GOOGLE_CLIENT_ID` constant
   near the top of the file.
7. Restart `npm run dev`. The "Sign in with Google" button will now appear
   and log the user in with their real Google account.

Until you complete these steps, the page still works via the **demo login**
form underneath the Google button (just a name + email, no password needed),
so you can build and test everything else without waiting on Google Cloud.

## Project structure

```
src/
  main.jsx, App.jsx           entry point & all routes
  App.css                      all styles
  SiteHeader.jsx                shared header/nav used on every customer page
  ThreadSpool.jsx, CategoryIcon.jsx   icon components
  ThemeToggle.jsx                dark/light mode toggle
  RequireAdmin.jsx               redirects to /admin if not logged in as admin
  context/
    ProductsContext.jsx          product catalog (localStorage-backed)
    CartContext.jsx              shopping cart (localStorage-backed)
    AuthContext.jsx               customer + admin auth (Google / demo / admin)
  pages/
    Home.jsx, Products.jsx, ProductDetail.jsx
    Cart.jsx, Checkout.jsx, OrderConfirmation.jsx
    Profile.jsx, Login.jsx, Contact.jsx
    admin/
      AdminLogin.jsx, AdminShell.jsx, AdminDashboard.jsx
      AdminProducts.jsx, AdminAddProduct.jsx
```

## Next steps (optional, for a real production version)

- Replace the `localStorage` layer with a real backend (Node/Express +
  MongoDB, as originally planned) so data is shared across devices and
  photos are stored properly instead of as base64 text.
- Move the hardcoded admin password into a real authenticated backend.
