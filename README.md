# NineJS Authentication module (ninejs/auth)

Provides a configurable authentication mechanism for your applications.

### ninejs/auth works on both client side and server side (Node.js)

## Server side (Node.js)

`ninejs/auth` registers the `ninejs-auth-module` AMD prefix into your client side. In this prefix resides the necessary JS files to serve the client side module.

### Parameters

* loginUrl: String. This is the endpoint where client side will post it's authentication request.

| Method | Action             | Returns |
|--------|--------------------|---------|
| GET    | Queries whether or not I (as a user) am logged into the system. | `{ result: String of ('success', 'failed'), id: 'username', loggedInSince: new Date(), permissions: [String] }` |
| POST   | Posts a login request to the server side. `{ user: 'username', password: '', parameters: {} }` | `{ result: String of ('success', 'failed'), message: String }` |

## Client side