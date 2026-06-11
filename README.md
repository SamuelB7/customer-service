# customer-service

Responsible for customer profiles, addresses, preferences, wishlists, and followed sellers.

Customer account service built with NestJS, Prisma, PostgreSQL, JWT validation, and Kafka integration events.

## Project Origin

This microservice is part of the [ecommerce-eda](https://github.com/SamuelB7/ecommerce-eda) event-driven marketplace platform.

## Endpoints

- `GET /health`
- `POST /events/demo`
- `GET /customers/me/profile`
- `PUT /customers/me/profile`
- `GET /customers/me/addresses`
- `POST /customers/me/addresses`
- `PUT /customers/me/addresses/:addressId`
- `DELETE /customers/me/addresses/:addressId`
- `PUT /customers/me/addresses/:addressId/default`
- `GET /customers/me/preferences`
- `PUT /customers/me/preferences`
- `GET /customers/me/wishlist`
- `POST /customers/me/wishlist/items`
- `DELETE /customers/me/wishlist/items/:itemId`
- `POST /customers/me/wishlist/share`
- `GET /wishlists/:shareToken`
- `GET /customers/me/followed-sellers`
- `POST /customers/me/followed-sellers`
- `DELETE /customers/me/followed-sellers/:sellerId`
- `GET /customers/me/orders`
- `POST /customers/me/privacy-exports`
- `GET /customers/me/privacy-exports`
- `GET /customers/me/privacy-exports/:requestId`

## Prisma

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

## Demo Topic

- `customer.demo.event.v1`

## Integration Events

Consumed:

- `auth.user.registered.v1`
- `orders.order.created.v1`
- `orders.order.status_changed.v1`

Stored in outbox:

- `customer.profile.created.v1`
- `customer.profile.updated.v1`
- `customer.address.created.v1`
- `customer.address.updated.v1`
- `customer.address.deleted.v1`
- `customer.preferences.updated.v1`
- `customer.wishlist.item_added.v1`
- `customer.wishlist.item_removed.v1`
- `customer.wishlist.shared.v1`
- `customer.seller.followed.v1`
- `customer.seller.unfollowed.v1`
- `customer.privacy_export_requested.v1`
